import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { Groq } from 'groq-sdk';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { Resend } from 'resend';
import Database from 'better-sqlite3';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';

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

// --- Security Middleware ---
// 1. Helmet sets secure HTTP headers (protects against XSS, clickjacking, etc.)
app.use(helmet({
  contentSecurityPolicy: false, // Disabled to easily allow React inline scripts in dev/prod
}));

// 2. Global Rate Limiting to prevent brute-force/DDoS attacks
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per 15 mins
  message: 'Too many requests from this IP, please try again after 15 minutes.'
});
app.use(globalLimiter);

// 3. Stricter Rate Limit for Contact Form (prevent email spam)
const contactLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5, // Limit each IP to 5 contact messages per hour
  message: { error: 'Too many messages sent. Please wait an hour before sending another.' }
});

// 4. Stricter Rate Limit for AI Chat (prevent API abuse)
const chatLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 30, // Limit each IP to 30 AI chat messages per 5 minutes
  message: { reply: 'Woah there! You are chatting too fast. Please wait a few minutes.' }
});

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
Date of Birth: ${config.dob || "Not specified"}
Location: ${config.location || "Not specified"}
Languages: ${config.languages ? config.languages.join(", ") : "Not specified"}
Bio: ${config.bio}
Education:
${config.education ? config.education.map(e => `- ${e.exam} (${e.year}) at ${e.institution}. Board: ${e.board}, Result: ${e.result}`).join("\n") : ""}
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
app.post('/api/chat', chatLimiter, async (req, res) => {
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
app.post('/api/contact', contactLimiter, async (req, res) => {
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

  // 2. Send email via Resend (HTTP API — works on Render Free Tier)
  try {
    const config = getConfig();
    const resend = new Resend(process.env.RESEND_API_KEY);

    await resend.emails.send({
      from: 'Portfolio Contact <onboarding@resend.dev>',
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
    console.error('Email error (message still saved to DB):', mailErr.message || mailErr);
    // Message is already safely saved to DB — don't expose email errors to the user
  }

  // Always return success since message is safely in DB
  res.json({ success: true, message: 'Message sent successfully!' });
});

// --- Admin: View All Messages ---
app.get('/api/messages', (req, res) => {
  const adminKey = req.query.key;
  if (adminKey !== process.env.ADMIN_KEY) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  const rows = db.prepare('SELECT * FROM contacts ORDER BY received_at DESC').all();
  // Return a nicely formatted HTML page
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Contact Messages</title>
      <style>
        body { font-family: sans-serif; background: #0f172a; color: #e2e8f0; padding: 2rem; }
        h1 { color: #818cf8; }
        .msg { background: #1e293b; border: 1px solid #334155; border-radius: 12px; padding: 1.5rem; margin-bottom: 1rem; }
        .meta { color: #94a3b8; font-size: 0.85rem; margin-bottom: 0.5rem; }
        .name { font-weight: bold; font-size: 1.1rem; }
        .email { color: #60a5fa; }
        .message { margin-top: 0.75rem; background: #0f172a; padding: 1rem; border-radius: 8px; white-space: pre-wrap; }
        .count { color: #94a3b8; margin-bottom: 2rem; }
      </style>
    </head>
    <body>
      <h1>📬 Portfolio Contact Messages</h1>
      <p class="count">${rows.length} message(s) received</p>
      ${rows.map(r => `
        <div class="msg">
          <div class="meta">#${r.id} &nbsp;·&nbsp; ${r.received_at}</div>
          <div class="name">${r.name}</div>
          <div class="email"><a href="mailto:${r.email}" style="color:#60a5fa">${r.email}</a></div>
          <div class="message">${r.message}</div>
        </div>
      `).join('')}
      ${rows.length === 0 ? '<p>No messages yet.</p>' : ''}
    </body>
    </html>
  `;
  res.send(html);
});

// Serve static React frontend in production
app.use(express.static(path.join(__dirname, '../frontend/dist')));
app.use((req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/dist/index.html'));
});

app.listen(PORT, () => {
  console.log(`Backend server running on http://localhost:${PORT}`);
});
