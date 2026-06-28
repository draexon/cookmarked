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
  lifestyle: ['lifestyle', 'home', 'style', 'wellness', 'routine', 'daily'],
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

function extractCategoryFromModelText(text) {
  const raw = String(text || '').trim();
  const jsonMatch = raw.match(/\{[\s\S]*\}/);
  if (jsonMatch) {
    try {
      const parsed = JSON.parse(jsonMatch[0]);
      if (parsed.explicit_cover_text === true || parsed.category_override === 'Other') {
        return 'Other';
      }
      return parsed.category || parsed.collection || parsed.topic || '';
    } catch (err) {
      console.warn('[gemini] category JSON parse failed', { error: err.message });
    }
  }
  return raw;
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

async function categorizeReel({ url, title, description, thumbnailUrl, existingCategories = [], existingCollections }) {
  const collections = existingCollections || existingCategories || [];
  const collectionList = collections.length > 0
    ? collections.map((name) => `- ${name}`).join('\n')
    : '- Other';

  const prompt = `
You are CookMarked's AI analyzer. Analyze this reel/video metadata and extract useful save details.

Reel title: "${title}"
Reel/video URL: "${url || ''}"
Reel caption/description: "${description}"
Thumbnail image: ${thumbnailUrl ? 'attached' : 'not available'}

Existing user collections:
${collectionList}

Rules:
1. If a thumbnail image is attached, analyze the reel cover first. Treat visible cover content and visible cover text as the primary source.
2. Use the title, caption, hashtags, URL text, and tags only as secondary evidence.
3. If the cover topic and caption/tag topic clearly match, use that shared broad category.
4. If the caption/tags conflict with the cover, ignore the caption/tags and choose the category from the cover image.
5. If the cover contains explicit, adult, sexual, violent, hateful, abusive, slur-like, scam, or unsafe words/text, set "category" to "Other", set "explicit_cover_text" to true, and do not use the caption/tags to override it.
6. If the cover image is unavailable or unreadable, fall back to the title/caption/tags.
7. Extract a broad category, not a tiny detail. Examples: Fitness, Travel, Fashion, DIY, Tech, Education, Comedy, Music.
8. Before suggesting a new category, compare it against every existing collection.
9. If any existing collection is semantically similar, put that exact existing collection name in "category", unless rule 5 applies.
10. Avoid creating too many collections. Use "Other" when there is no useful cover, title, caption, tag, or URL detail.
11. Return ONLY compact JSON with these keys: title, category, description, creator_name, tags, cover_topic, caption_topic, cover_caption_match, explicit_cover_text.
`;

  try {
    const imagePart = await getImagePart(thumbnailUrl);
    const parts = imagePart ? [prompt, imagePart] : [prompt];
    const result = await model.generateContent(parts);
    const category = matchExistingCollection(extractCategoryFromModelText(result.response.text()), collections) || 'Other';
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
