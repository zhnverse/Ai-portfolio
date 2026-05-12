import dotenv from 'dotenv';
import { Groq } from 'groq-sdk';
dotenv.config();

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

async function test() {
  try {
    const chatCompletion = await groq.chat.completions.create({
      messages: [{ role: "user", content: "Hello" }],
      model: "llama3-8b-8192",
    });
    console.log("Success:", chatCompletion.choices[0]?.message?.content);
  } catch (error) {
    console.error("Error:", error);
  }
}
test();
