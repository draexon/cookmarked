const { GoogleGenerativeAI } = require('@google/generative-ai');
const { geminiApiKey } = require('../config');

const genAI = new GoogleGenerativeAI(geminiApiKey);
// Fallback to flash if no env var, just in case
const modelName = process.env.GEMINI_MODEL || 'gemini-flash-latest';
const model = genAI.getGenerativeModel({ model: modelName });

async function categorizeReel({ url, title, description, existingCategories = [], existingCollections = [] }) {
  // No signal at all — skip Gemini entirely
  if (!title?.trim() && !description?.trim()) {
    return 'Uncategorized';
  }

  const collections = existingCollections.length > 0 ? existingCollections : existingCategories;
  const categoryList = collections.length > 0
    ? `User's existing categories: ${collections.join(', ')}`
    : 'User has no categories yet.';

  const prompt = `
You are AllMarked's AI categorizer. Categorize this saved reel.

Reel URL: "${url || ''}"
Reel title: "${title}"
Reel description: "${description}"

${categoryList}

Rules:
1. If title is generic (just "reel", "video", "login", "untitled", or empty) 
   → use hashtags from description ONLY
2. Hashtags are strongest signal:
   #skating/#skate → Sports
   #food/#recipe/#cooking → Food
   #travel/#wanderlust → Travel
   #cars/#automotive → Cars
   #fitness/#gym/#workout → Fitness
   #comedy/#funny/#memes → Comedy
   #fashion/#ootd → Fashion
   #tech/#coding → Technology
3. If reel fits existing category → return that EXACT name
4. If new topic → create short 1-2 word category (Title Case)
5. If truly nothing to go on → return "Other"
6. Reply with ONLY the category name. Nothing else.
`;

  try {
    const result = await model.generateContent(prompt);
    const category = result.response.text().trim();
    return category || 'Other';
  } catch (err) {
    console.error('[gemini] categorization failed', err.message);
    return 'Other';
  }
}

module.exports = { categorizeReel };
