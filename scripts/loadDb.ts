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

      let retries = 3;
      while (retries > 0) {
        try {
          console.log(`Inserting chunk ${i} for character ${name}`);
          const res = await collection.insertOne({
            document_id: id,
            $vector: data[0]?.embedding,
            name,
            description: chunk,
          });
          console.log(`Insert result for chunk ${i}:`, res);
          if (!res.insertedId) {
            console.error(`Failed to insert chunk ${i} for character ${name}`);
          }
          break; // Si l'insertion réussit, sortir de la boucle
        } catch (error) {
          console.error(
            `Error inserting chunk ${i} for character ${name}:`,
            error
          );
          retries--;
          if (retries === 0) {
            throw error; // Si plus de tentatives, relancer l'erreur
          }
          console.log(`Retrying in 5 seconds... (${retries} retries left)`);
          await new Promise((resolve) => setTimeout(resolve, 5000)); // Attendre 5 secondes avant de réessayer
        }
      }
      i++;
    }
  }
  console.log("data loaded");
};

createCollection()
  .then(() => loadSampleData())
  .catch((error) => {
    console.error("Unrecoverable error:", error);
    // Vous pouvez ajouter ici une logique supplémentaire pour gérer les erreurs irrécupérables
  });
