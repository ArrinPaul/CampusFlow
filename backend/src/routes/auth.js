const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { getClient } = require("../services/supabase");
const authMiddleware = require("../middleware/auth");

const router = express.Router();

router.post("/register", async (req, res) => {
  try {
    const { name, email, password, branch, year, telegram_username, subjects } = req.body;

    if (!name || !email || !password || !branch || !year || !telegram_username) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const { data: existing } = await getClient()
      .from("students")
      .select("id")
      .eq("email", email)
      .single();

    if (existing) {
      return res.status(400).json({ message: "Email already registered" });
    }

    const password_hash = await bcrypt.hash(password, 10);

    const { data: student, error } = await getClient()
      .from("students")
      .insert({
        name,
        email,
        password_hash,
        branch,
        year,
        telegram_username,
        subjects: subjects || [],
      })
      .select("id, name, email, branch, year, telegram_username, subjects, created_at")
      .single();

    if (error) throw error;

    const token = jwt.sign(
      { id: student.id, email: student.email },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({ token, student });
  } catch (error) {
    res.status(500).json({ message: error.message || "Registration failed" });
  }
});

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    const { data: student, error } = await getClient()
      .from("students")
      .select("*")
      .eq("email", email)
      .single();

    if (error || !student) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const valid = await bcrypt.compare(password, student.password_hash);
    if (!valid) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const token = jwt.sign(
      { id: student.id, email: student.email },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    const { password_hash, ...studentData } = student;
    res.json({ token, student: studentData });
  } catch (error) {
    res.status(500).json({ message: error.message || "Login failed" });
  }
});

router.get("/me", authMiddleware, async (req, res) => {
  try {
    if (req.student.id === "00000000-0000-0000-0000-000000000000") {
      return res.json({ student: req.student });
    }

    const { data: student, error } = await getClient()
      .from("students")
      .select("id, name, email, branch, year, telegram_username, subjects, created_at")
      .eq("id", req.student.id)
      .single();

    if (error || !student) {
      return res.status(404).json({ message: "Student not found" });
    }

    res.json({ student });
  } catch (error) {
    res.status(500).json({ message: error.message || "Failed to fetch profile" });
  }
});

router.put("/me", authMiddleware, async (req, res) => {
  try {
    const { name, branch, year, telegram_username, subjects } = req.body;

    const { data: student, error } = await getClient()
      .from("students")
      .update({ name, branch, year, telegram_username, subjects })
      .eq("id", req.student.id)
      .select("id, name, email, branch, year, telegram_username, subjects, created_at")
      .single();

    if (error) throw error;
    res.json({ student });
  } catch (error) {
    res.status(500).json({ message: error.message || "Failed to update profile" });
  }
});

module.exports = router;
