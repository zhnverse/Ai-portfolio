# Full-Stack AI-Powered Personal Portfolio

**Live Demo:** [https://ai-portfolio-klrz.onrender.com/](https://ai-portfolio-klrz.onrender.com/)

This is a modern, dark-themed personal portfolio website powered by React, Tailwind CSS v4, Framer Motion, Node.js, Express, and the Groq AI API.

## Features
- **Centralized Configuration**: Easily customize the entire portfolio (bio, skills, projects, name, etc.) by editing a single `owner.config.json` file.
- **AI Chat Widget**: A smart floating chat widget built using the `llama3-8b-8192` model via Groq API. The AI automatically uses your `owner.config.json` as its system prompt context to answer visitor questions accurately.
- **Beautiful UI**: Glassmorphism, smooth animations, responsive design.

## Project Structure
- `backend/`: Node.js + Express API. Serves the config to the frontend and acts as a proxy for the Groq API.
- `frontend/`: React + Vite + Tailwind CSS v4 frontend.

## Quick Start

### 1. Backend Setup
```bash
cd backend
npm install
```
- Create a `.env` file in the `backend` directory:
  ```env
  PORT=5000
  GROQ_API_KEY=your_groq_api_key_here
  ```
- Edit `backend/owner.config.json` with your details.
- Start the server:
  ```bash
  npm run dev
  ```
  *(Server runs on http://localhost:5000)*

### 2. Frontend Setup
Open a new terminal.
```bash
cd frontend
npm install
npm run dev
```
*(Frontend runs on http://localhost:5173)*

## Customization
To customize your portfolio, open `backend/owner.config.json` and update the JSON properties. The AI and the UI will automatically adapt to your new content!
