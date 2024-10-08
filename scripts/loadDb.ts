import { DataAPIClient } from "@datastax/astra-db-ts";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import "dotenv/config";
import OpenAI from "openai";
import sampleData from "./sample_data.json";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const client = new DataAPIClient(process.env.ASTRA_DB_APPLICATION_TOKEN);
const db = client.db(process.env.ASTRA_DB_API_ENDPOINT, {
  namespace: process.env.ASTRA_DB_NAMESPACE,
});

const splitter = new RecursiveCharacterTextSplitter({
  chunkSize: 1000,
  chunkOverlap: 200,
});

const createCollection = async () => {
  try {
    const res = await db.createCollection("characters", {
      vector: {
        dimension: 1536,
      },
    });
    console.log(res);
  } catch (e) {
    console.log("characters collection already exists");
  }
};

const loadSampleData = async () => {
  const collection = await db.collection("characters");
  for await (const { id, name, description } of sampleData) {
    const chunks = await splitter.splitText(description);
    let i = 0;
    for await (const chunk of chunks) {
      const { data } = await openai.embeddings.create({
        input: chunk,
        model: "text-embedding-ada-002",
      });

      const res = await collection.insertOne({
        document_id: id,
        $vector: data[0]?.embedding,
        name,
        description: chunk,
      });
      console.log(`Inserted chunk ${i} for ${name}`);
      i++;
    }
  }
  console.log("data loaded");
};

createCollection()
  .then(() => loadSampleData())
  .catch((error) => {
    console.error("Unrecoverable error:", error);
  });
