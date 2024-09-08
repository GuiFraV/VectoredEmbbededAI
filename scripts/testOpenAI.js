import OpenAI from "openai";
import "dotenv/config";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

async function testOpenAI() {
  try {
    const response = await openai.embeddings.create({
      input: "This is a test.",
      model: "text-embedding-ada-002",
    });
    console.log("OpenAI API response:", response);
  } catch (error) {
    console.error("Error calling OpenAI API:", error);
  }
}

testOpenAI();
