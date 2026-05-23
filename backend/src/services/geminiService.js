const { GoogleGenerativeAI } = require('@google/generative-ai');
const axios = require('axios');
const { geminiApiKey } = require('../config');

const genAI = new GoogleGenerativeAI(geminiApiKey);
const modelName = process.env.GEMINI_MODEL || 'gemini-2.5-flash';
const model = genAI.getGenerativeModel({ model: modelName });

function cleanCategory(value) {
  return String(value || '')
    .split('\n')[0]
    .replace(/^["'`]+|["'`]+$/g, '')
    .replace(/^category:\s*/i, '')
    .trim()
    .slice(0, 40);
}

const SIMILAR_TOPIC_WORDS = {
  food: ['food', 'recipe', 'recipes', 'cooking', 'cook', 'meal', 'dish', 'pasta', 'pizza', 'biryani', 'dinner', 'lunch', 'breakfast'],
  fitness: ['fitness', 'workout', 'gym', 'exercise', 'training', 'cardio', 'yoga', 'hiit'],
  travel: ['travel', 'trip', 'tour', 'hotel', 'flight', 'vacation', 'beach', 'mountain'],
  dance: ['dance', 'dancing', 'choreography', 'choreograph'],
  chess: ['chess', 'gambit', 'checkmate', 'knight', 'bishop', 'rook'],
  tech: ['tech', 'technology', 'coding', 'programming', 'software', 'app', 'ai'],
};

function wordsFor(value) {
  return String(value || '')
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter(Boolean);
}

function matchExistingCollection(category, collections) {
  const cleaned = cleanCategory(category);
  if (!cleaned || !collections.length) return cleaned;

  const exact = collections.find((name) => name.toLowerCase() === cleaned.toLowerCase());
  if (exact) return exact;

  const categoryWords = wordsFor(cleaned);
  const containsMatch = collections.find((name) => {
    const collectionWords = wordsFor(name);
    return categoryWords.some((word) => collectionWords.includes(word)) ||
      collectionWords.some((word) => categoryWords.includes(word));
  });
  if (containsMatch) return containsMatch;

  for (const relatedWords of Object.values(SIMILAR_TOPIC_WORDS)) {
    const categoryMatchesGroup = categoryWords.some((word) => relatedWords.includes(word));
    if (!categoryMatchesGroup) continue;

    const relatedCollection = collections.find((name) =>
      wordsFor(name).some((word) => relatedWords.includes(word))
    );
    if (relatedCollection) return relatedCollection;
  }

  return cleaned;
}

async function getImagePart(thumbnailUrl) {
  if (!thumbnailUrl) return null;

  try {
    const response = await axios.get(thumbnailUrl, {
      responseType: 'arraybuffer',
      timeout: 8000,
      maxContentLength: 5 * 1024 * 1024,
      headers: {
        'User-Agent': 'Mozilla/5.0 CookMarked/1.0',
        Accept: 'image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8',
      },
    });

    const contentType = String(response.headers['content-type'] || '').split(';')[0];
    if (!contentType.startsWith('image/')) return null;
    if (contentType === 'image/svg+xml') return null;

    return {
      inlineData: {
        data: Buffer.from(response.data).toString('base64'),
        mimeType: contentType,
      },
    };
  } catch (err) {
    console.warn('[gemini] thumbnail analysis skipped', { thumbnailUrl, error: err.message });
    return null;
  }
}

async function categorizeReel({ title, description, thumbnailUrl, existingCategories = [], existingCollections }) {
  const collections = existingCollections || existingCategories || [];
  const collectionList = collections.length > 0
    ? collections.map((name) => `- ${name}`).join('\n')
    : '- Other';

  const prompt = `
You are CookMarked's AI categorizer. Your job is to categorize a saved reel.

Reel title: "${title}"
Reel caption/description: "${description}"
Thumbnail image: ${thumbnailUrl ? 'attached' : 'not available'}

Existing user collections:
${collectionList}

Rules:
1. First understand the caption/title text. Treat it as the primary source.
2. Use the thumbnail image only when the text is generic, missing, clickbait, or unclear.
3. Extract the main broad topic, not a tiny detail. Examples: Food, Fitness, Travel, Dance, Chess, Tech.
4. Before creating a new collection, compare the extracted topic against every existing collection.
5. If any existing collection is semantically similar, return that exact existing collection name.
   Examples: pasta/recipe/cooking -> Food, workout/gym -> Fitness, trip/hotel -> Travel.
6. Avoid creating too many collections. Create a new collection only when no existing collection is a good match.
7. If there is no useful text or image detail, return exactly: Other.
8. Reply with ONLY the final collection name. No JSON, no explanation.
`;

  try {
    const imagePart = await getImagePart(thumbnailUrl);
    const parts = imagePart ? [prompt, imagePart] : [prompt];
    const result = await model.generateContent(parts);
    const category = matchExistingCollection(result.response.text(), collections) || 'Other';
    console.info('[gemini] categorized reel', {
      model: modelName,
      category,
      usedThumbnail: Boolean(imagePart),
    });
    return category;
  } catch (err) {
    console.error('[gemini] categorization failed', { model: modelName, error: err.message });
    return 'Other';
  }
}

module.exports = { categorizeReel };
