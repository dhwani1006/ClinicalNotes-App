import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import Groq from "groq-sdk";
import mongoose from "mongoose";
import path from "path";
import { fileURLToPath } from "url";

// Routes
import notesRoutes from "./routes/notes.js";
import authRoutes from "./routes/auth.js";
import usersRoutes from "./routes/users.js"; // 👈 NEW (for profile pic)

// Load env
dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());
app.use("/api/users", usersRoutes);


// ===== Fix __dirname for ES modules =====
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ===== Serve uploaded images =====
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// 🔌 Connect MongoDB
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => console.error("❌ MongoDB error:", err));

// Groq AI setup
const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

// ========== AI ROUTE ==========
app.post("/api/ai/suggest", async (req, res) => {
  try {
    const { symptoms } = req.body;

    if (!symptoms || symptoms.trim().length < 3) {
      return res.json({
        diagnosis: [],
        medicines: [],
        labTests: [],
        advice: [],
      });
    }

    const prompt = `
You are a medical assistant.

Patient symptoms: ${symptoms}

Return ONLY valid JSON in this exact format (no markdown, no explanation):

{
  "diagnosis": ["...","..."],
  "medicines": ["...","...","..."],
  "labTests": ["...","..."],
  "advice": ["...","..."]
}
`;

    const completion = await groq.chat.completions.create({
      model: "llama-3.1-8b-instant",
      messages: [
        {
          role: "system",
          content: "You are a medical assistant that outputs only JSON.",
        },
        { role: "user", content: prompt },
      ],
      temperature: 0.3,
    });

    const text = completion.choices[0].message.content;

    let data;
    try {
      data = JSON.parse(text);
    } catch (e) {
      console.error("Raw AI response:", text);
      return res.status(500).json({ error: "AI returned invalid JSON" });
    }

    res.json({
      diagnosis: data.diagnosis || [],
      medicines: data.medicines || [],
      labTests: data.labTests || [],
      advice: data.advice || [],
    });
  } catch (err) {
    console.error("Groq error:", err);
    res.status(500).json({ error: "AI error" });
  }
});

// ========== Auth routes ==========
app.use("/api/auth", authRoutes);

// ========== Notes routes ==========
app.use("/api/notes", notesRoutes);

// ========== Users routes (Profile, Avatar) ==========
app.use("/api/users", usersRoutes); // 👈 NEW

// Start server
const PORT = process.env.PORT || 5000;

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Backend running on port ${PORT}`);
});