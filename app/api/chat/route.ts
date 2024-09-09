import OpenAI from "openai";
import { OpenAIStream, StreamingTextResponse } from "ai";
import { DataAPIClient } from "@datastax/astra-db-ts";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const client = new DataAPIClient(process.env.ASTRA_DB_APPLICATION_TOKEN);
const db = client.db(process.env.ASTRA_DB_API_ENDPOINT, {
  namespace: process.env.ASTRA_DB_NAMESPACE,
});

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();

    const latestMessage = messages[messages?.length - 1]?.content;

    let docContext = "";

    const { data } = await openai.embeddings.create({
      input: latestMessage,
      model: "text-embedding-ada-002",
    });

    const collection = await db.collection("characters");

    const cursor = collection.find(null, {
      sort: {
        $vector: data[0]?.embedding,
      },
      limit: 5,
    });

    const documents = await cursor.toArray();

    console.log(documents);
  } catch (e) {
    throw e;
  }
}
