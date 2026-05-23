const { GoogleGenerativeAI } = require('@google/generative-ai');
const { geminiApiKey } = require('../config');

const genAI = new GoogleGenerativeAI(geminiApiKey);
const modelName = process.env.GEMINI_MODEL || 'gemini-2.5-flash';
const model = genAI.getGenerativeModel({ model: modelName });

async function categorizeReel({ title, description, existingCategories }) {
  const categoryList = existingCategories.length > 0
    ? `User's existing categories: ${existingCategories.join(', ')}`
    : 'User has no categories yet.';

  const prompt = `
You are CookMarked's AI categorizer. Your job is to categorize a saved reel.

Reel title: "${title}"
Reel description: "${description}"

${categoryList}

Rules:
1. If the reel fits an existing category, return that exact category name.
2. If it doesn't fit any existing category, create a short new category name (1-2 words, Title Case).
3. If you truly cannot understand the topic, return exactly: "Other"
4. Reply with ONLY the category name. Nothing else.
`;

  try {
    const result = await model.generateContent(prompt);
    const category = result.response.text().trim();
    console.info('[gemini] categorized reel', { model: modelName, category });
    return category || 'Other';
  } catch (err) {
    console.error('[gemini] categorization failed', { model: modelName, error: err.message });
    return 'Other';
  }
}

module.exports = { categorizeReel };
