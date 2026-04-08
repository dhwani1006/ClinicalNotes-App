import express from "express";
import Note from "../models/Note.js";
import auth from "../middleware/auth.js";

const router = express.Router();

// ✅ Create note (only for logged-in user)
router.post("/", auth, async (req, res) => {
  try {
    const note = new Note({
      ...req.body,
      user: req.user.id, // 👈 attach note to this user
    });

    const saved = await note.save();
    res.status(201).json(saved);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to save note" });
  }
});

// ✅ Get ONLY my notes
router.get("/", auth, async (req, res) => {
  try {
    const notes = await Note.find({ user: req.user.id }).sort({
      createdAt: -1,
    });
    res.json(notes);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch notes" });
  }
});

// ✅ Get single note (only if it belongs to me)
router.get("/:id", auth, async (req, res) => {
  try {
    const note = await Note.findOne({
      _id: req.params.id,
      user: req.user.id,
    });

    if (!note) {
      return res.status(404).json({ error: "Note not found" });
    }

    res.json(note);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch note" });
  }
});

export default router;



