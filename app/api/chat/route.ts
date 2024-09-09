import OpenAI from "openai";
import { OpenAIStream, StreamingTextResponse } from "ai";
import { DataAPIClient } from "@datastax/astra-db-ts";
import sampleData from "../../../scripts/sample_data.json"; // Assurez-vous que le chemin est correct

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const client = new DataAPIClient(process.env.ASTRA_DB_APPLICATION_TOKEN);
const db = client.db(process.env.ASTRA_DB_API_ENDPOINT, {
  namespace: process.env.ASTRA_DB_NAMESPACE,
});

function isStarWarsRelated(message: string): boolean {
  const starWarsKeywords = [
    "star wars",
    "jedi",
    "sith",
    "skywalker",
    "yoda",
    "darth vader",
  ];
  return starWarsKeywords.some((keyword) =>
    message.toLowerCase().includes(keyword)
  );
}

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();
    if (!messages || messages.length === 0) {
      throw new Error("No messages provided");
    }

    const latestMessage = messages[messages.length - 1]?.content;
    if (!latestMessage) {
      throw new Error("Latest message content is empty");
    }

    // Recherche dans les données locales
    console.log("Recherche dans les données locales pour:", latestMessage);
    const found = sampleData.find((item) =>
      latestMessage.toLowerCase().includes(item.name.toLowerCase())
    );
    if (found) {
      console.log("Trouvé dans les données locales:", found);
      return new Response(JSON.stringify({ answer: found.description }), {
        status: 200,
      });
    }

    // Vérifiez si la question est liée à Star Wars
    if (!isStarWarsRelated(latestMessage)) {
      return new Response(
        JSON.stringify({
          answer: "Désolé, je ne peux répondre qu'aux questions sur Star Wars.",
        }),
        {
          status: 200,
        }
      );
    }

    let docContext = "";

    const { data } = await openai.embeddings.create({
      input: latestMessage,
      model: "text-embedding-ada-002",
    });

    if (!data || data.length === 0) {
      throw new Error("Failed to create embeddings");
    }

    const collection = await db.collection("characters");

    const cursor = collection.find(null, {
      sort: {
        $vector: data[0]?.embedding,
      },
      limit: 1,
    });

    const documents = await cursor.toArray();
    if (!documents || documents.length === 0) {
      throw new Error("No documents found");
    }

    docContext = `
    START CONTEXT
    ${documents.map((doc) => doc.description).join("\n")}
    END CONTEXT
    `;

    const ragPrompt = [
      {
        role: "system",
        content: `Tu es un assistant très utile qui peut répondre à des questions sur Star Wars. Ton Format de réponses est en markdown là où c'est applicable. 
        ${docContext}
        Si la réponse n'est pas fournie par le contexte, l'assistant AI répondra "Désolé, je n'ai pas la réponse". 
        Ne réponds qu'aux questions sur Star Wars. Si la question n'est pas liée à Star Wars, réponds "Désolé, je ne peux répondre qu'aux questions sur Star Wars".
        `,
      },
    ];

    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      stream: true,
      messages: [...ragPrompt, ...messages],
    });

    const stream = OpenAIStream(response);
    return new StreamingTextResponse(stream);
  } catch (e) {
    console.error("Error in POST /api/chat:", e);
    return new Response(JSON.stringify({ error: e.message }), { status: 500 });
  }
}
