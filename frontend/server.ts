import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

// Retired AI Studio mock server. The frontend now calls backend/src/index.js through src/api/reelService.ts.
async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Safe checks for configuration
  const hasApiKey = !!process.env.GEMINI_API_KEY;
  console.log("[CookMarked Server] Checking Gemini key configuration:", hasApiKey ? "AVAILABLE" : "MISSING");

  // Lazy client accessor to avoid crashing on startup
  const getGeminiClient = () => {
    const key = process.env.GEMINI_API_KEY;
    if (!key || key.includes("MY_GEMINI_API_KEY")) {
      return null;
    }
    return new GoogleGenAI({
      apiKey: key,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
  };

  // API Check Endpoint
  app.get("/api/health", (req, res) => {
    res.json({
      status: "ok",
      serverTime: new Date().toISOString(),
      geminiConfigured: !!process.env.GEMINI_API_KEY && !process.env.GEMINI_API_KEY.includes("MY_GEMINI_API_KEY")
    });
  });

  // Dynamic Parse Endpoint utilizing Google Gemini AI
  app.post("/api/gemini/parse", async (req, res) => {
    const { url = '', titleInput = '' } = req.body;
    console.log("[CookMarked Server] Parsing link request received:", { url, titleInput });

    const ai = getGeminiClient();

    if (!ai) {
      console.warn("[CookMarked Server] Gemini API key missing or unconfigured. Activating premium heuristic parser.");
      // Instantly return smart customized default
      return res.json(ruleBasedFallback(url, titleInput));
    }

    try {
      const prompt = `
        You are an expert culinary AI classifier for CookMarked—a premium reel organizer platform.
        The user has pasted a link to a recipe cooking video.
        URL: "${url}"
        User Context Hint (e.g. video search title / text): "${titleInput}"

        Based on the input url and optional text, parse or organically synthesize a beautifully formulated culinary card object containing:
        - title: An appetizing, polished human dish name (e.g., "Crispy Truffle Garlic Potato Herb Salad", "Easy 15-Min Skillet Shakshuka"). If the user provided a title text already, clean it up and expand it.
        - platform: Determine the correct origin platform based on URL patterns. Use 'Instagram', 'TikTok', 'YouTube', or 'Pinterest'. Default to 'Instagram' if unknown.
        - category: Select one modern kitchen category, e.g. 'Vegan', 'Italian', 'Breakfast', 'Dessert', 'Seafood', 'Gluten-Free', 'Healthy & Lean', 'Dinner'.
        - duration: An estimated realistic cooking range string (e.g., "15 MIN", "30 MIN", "45 MIN").
        - description: A short, enthusiastic 1-sentence description on why this video is amazing (max 100 characters).
        - imageUrl: A photo link suited for this food choice. Pick one of these premium high-quality Unsplash food links that matches the category:
          1) Salad/Healthy: https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=500&q=80
          2) Pizza/Italian: https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=500&q=80
          3) Noodle/Ramen/Asian: https://images.unsplash.com/photo-1569718212165-3a8278d5f624?auto=format&fit=crop&w=500&q=80
          4) Cake/Sweet/Dessert: https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=500&q=80
          5) General Delicious Dish/Seafood/Breakfast: https://images.unsplash.com/photo-1590412200988-a436bb705300?auto=format&fit=crop&w=500&q=80
          Or another valid Unsplash public culinary image URL.

        Respond with STRICT JSON format matching the schema properties exactly.
      `;

      // Request structured output using Schema
      const result = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
              platform: { type: Type.STRING },
              imageUrl: { type: Type.STRING },
              category: { type: Type.STRING },
              duration: { type: Type.STRING },
              description: { type: Type.STRING }
            },
            required: ["title", "platform", "imageUrl", "category", "duration", "description"]
          }
        }
      });

      const text = result.text;
      if (!text) {
        throw new Error("Empty text returned from Google GenAI model.");
      }

      console.log("[CookMarked Server] Gemini parsed response text:", text);
      const parsedRecipe = JSON.parse(text.trim());
      res.json(parsedRecipe);

    } catch (err) {
      console.error("[CookMarked Server] GenAI API failed. Falling back to rule-based parsing engine.", err);
      res.json(ruleBasedFallback(url, titleInput));
    }
  });

  // Safe heuristic fallback parser
  function ruleBasedFallback(url: string, titleInput: string) {
    let platform: 'Instagram' | 'TikTok' | 'YouTube' | 'Pinterest' = 'Instagram';
    const lowUrl = url.toLowerCase();
    if (lowUrl.includes("tiktok")) platform = "TikTok";
    else if (lowUrl.includes("youtube") || lowUrl.includes("youtu.be")) platform = "YouTube";
    else if (lowUrl.includes("pinterest")) platform = "Pinterest";

    let title = titleInput.trim();
    let category = "Dinner";
    let duration = "25 MIN";
    let imageUrl = "https://images.unsplash.com/photo-1590412200988-a436bb705300?auto=format&fit=crop&w=500&q=80";
    let description = "A quick savory meal captured in a beautiful culinary clip.";

    if (!title) {
      if (lowUrl.includes("ramen") || lowUrl.includes("noodle") || lowUrl.includes("spicy")) {
        title = "Garlic Chili Soy Ramen Hack";
        category = "Breakfast";
        duration = "10 MIN";
        imageUrl = "https://images.unsplash.com/photo-1569718212165-3a8278d5f624?auto=format&fit=crop&w=500&q=80";
        description = "Chili-glazed noodle strands cooked inside rich vegetable-based soy sauce.";
      } else if (lowUrl.includes("bread") || lowUrl.includes("sour") || lowUrl.includes("bake")) {
        title = "Artisanal Rosemary Sourdough Bread";
        category = "Dinner";
        duration = "45 MIN";
        imageUrl = "https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=500&q=80";
        description = "Traditional slow fermented loaf sprinkled with flaky salt and garden herbs.";
      } else if (lowUrl.includes("pasta") || lowUrl.includes("pizza") || lowUrl.includes("burrata")) {
        title = "Honey Glazed Burrata Pizza";
        category = "Italian";
        duration = "30 MIN";
        imageUrl = "https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=500&q=80";
        description = "Decadent fresh burrata ball with spicy wild mountain honey drizzle.";
      } else {
        title = "Zesty Garden Avocado Toast";
        category = "Breakfast";
        duration = "15 MIN";
        imageUrl = "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=500&q=80";
        description = "Organic multigrain slice loaded with mashed avocado, pumpkin seeds and radishes.";
      }
    } else {
      // Set image by keyword
      const lowTitle = title.toLowerCase();
      if (lowTitle.includes("salad") || lowTitle.includes("green") || lowTitle.includes("potato")) {
        imageUrl = "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=500&q=80";
        category = "Vegan";
      } else if (lowTitle.includes("pizza") || lowTitle.includes("pasta") || lowTitle.includes("burrata")) {
        imageUrl = "https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=500&q=80";
        category = "Italian";
      } else if (lowTitle.includes("ramen") || lowTitle.includes("noodle") || lowTitle.includes("tuna") || lowTitle.includes("bowl")) {
        imageUrl = "https://images.unsplash.com/photo-1569718212165-3a8278d5f624?auto=format&fit=crop&w=500&q=80";
        category = "Seafood";
      } else if (lowTitle.includes("cake") || lowTitle.includes("chocolate") || lowTitle.includes("dessert")) {
        imageUrl = "https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=500&q=80";
        category = "Dessert";
      }
    }

    return { title, platform, imageUrl, category, duration, description };
  }

  // Vite development server / production bundler client gateway mount
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
    console.log("[CookMarked Server] Vite Development middleware integrated successfully.");
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
    console.log("[CookMarked Server] Serving static production build at:", distPath);
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[CookMarked Server] Running and listening on http://0.0.0.0:${PORT}`);
  });
}

// Disabled intentionally: do not launch the generated mock API in place of the real backend.
// startServer();
