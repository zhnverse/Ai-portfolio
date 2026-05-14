import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { Groq } from 'groq-sdk';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import nodemailer from 'nodemailer';
import Database from 'better-sqlite3';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// --- SQLite Database Setup ---
const db = new Database(path.join(__dirname, 'contacts.db'));
db.exec(`
  CREATE TABLE IF NOT EXISTS contacts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    message TEXT NOT NULL,
    received_at TEXT DEFAULT (datetime('now'))
  )
`);

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Initialize Groq client
const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

// Load config dynamically
const getConfig = () => {
  const configPath = path.join(__dirname, 'owner.config.json');
  try {
    const configData = fs.readFileSync(configPath, 'utf8');
    return JSON.parse(configData);
  } catch (error) {
    console.error("Error reading owner.config.json:", error);
    return {};
  }
};

// Generate system prompt dynamically
const generateSystemPrompt = (config) => {
  return `You are the AI assistant for a personal portfolio website owned by ${config.name}. 
Their title is: ${config.title}.
Bio: ${config.bio}
Skills: ${config.skills ? config.skills.join(", ") : ""}
Projects:
${config.projects ? config.projects.map(p => `- ${p.title}: ${p.description} (Tech: ${p.techStack.join(", ")})`).join("\n") : ""}

Your goal is to answer questions from visitors about ${config.name}. 
Be helpful, concise, and professional. If a visitor asks about something not related to the portfolio, politely guide them back to ${config.name}'s professional work.
If they ask to hire or contact, direct them to use the contact form or email ${config.email}.`;
};

// API Endpoint to serve configuration to frontend
app.get('/api/portfolio-data', (req, res) => {
  const ownerConfig = getConfig();
  res.json(ownerConfig);
});

// API Endpoint for AI Chat
app.post('/api/chat', async (req, res) => {
  try {
    const { message, history = [] } = req.body;
    
    if (!message) {
      return res.status(400).json({ error: "Message is required" });
    }

    const config = getConfig();
    const messages = [
      { role: "system", content: generateSystemPrompt(config) },
      ...history.map(msg => ({
        role: msg.role === 'ai' ? 'assistant' : 'user',
        content: msg.content
      })),
      { role: "user", content: message }
    ];

    const chatCompletion = await groq.chat.completions.create({
      messages: messages,
      model: "llama-3.1-8b-instant",
      temperature: 0.5,
      max_tokens: 512,
    });

    const reply = chatCompletion.choices[0]?.message?.content || "I'm sorry, I couldn't process that request right now.";
    
    res.json({ reply });
  } catch (error) {
    console.error("Error in /api/chat:", error);
    res.status(500).json({ error: "Failed to generate AI response" });
  }
});

// --- Contact Form Endpoint ---
app.post('/api/contact', async (req, res) => {
  const { name, email, message } = req.body;

  if (!name || !email || !message) {
    return res.status(400).json({ error: 'All fields are required.' });
  }

  // 1. Save to SQLite database
  try {
    const stmt = db.prepare('INSERT INTO contacts (name, email, message) VALUES (?, ?, ?)');
    stmt.run(name, email, message);
  } catch (dbErr) {
    console.error('DB error:', dbErr);
    return res.status(500).json({ error: 'Failed to save message.' });
  }

  // 2. Send email via Gmail
  try {
    const config = getConfig();
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASSWORD,
      },
    });

    await transporter.sendMail({
      from: `"Portfolio Contact" <${process.env.GMAIL_USER}>`,
      to: config.email,
      replyTo: email,
      subject: `📬 New message from ${name} via Portfolio`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 12px;">
          <h2 style="color: #6366f1;">New Portfolio Contact</h2>
          <p><strong>Name:</strong> ${name}</p>
          <p><strong>Email:</strong> <a href="mailto:${email}">${email}</a></p>
          <hr style="border-color: #e2e8f0;" />
          <p><strong>Message:</strong></p>
          <p style="background: #f8fafc; padding: 16px; border-radius: 8px;">${message.replace(/\n/g, '<br/>')}</p>
        </div>
      `,
    });
  } catch (mailErr) {
    console.error('Email error:', mailErr);
    // Don't fail the whole request — message is already saved to DB
    return res.status(207).json({ warning: 'Message saved but email delivery failed.' });
  }

  res.json({ success: true, message: 'Message sent successfully!' });
});

// Serve static React frontend in production
app.use(express.static(path.join(__dirname, '../frontend/dist')));
app.use((req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/dist/index.html'));
});

app.listen(PORT, () => {
  console.log(`Backend server running on http://localhost:${PORT}`);
});
