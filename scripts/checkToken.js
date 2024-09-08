const fetch = require("node-fetch");

const ASTRA_DB_API_ENDPOINT =
  "https://c89bf2d7-ad42-4221-a32f-53f397437c68-us-east-2.apps.astra.datastax.com/api/rest/v2/schemas/keyspaces";
const ASTRA_DB_APPLICATION_TOKEN =
  "AstraCS:owvCvONepNaMPbINQKCjDhsF:38846f51d48118e139bf650a256735ccea080b22fc5b0bb429acdd5924dce7fc"; // Remplacez par votre token

async function checkToken() {
  try {
    const response = await fetch(ASTRA_DB_API_ENDPOINT, {
      method: "GET",
      headers: {
        "X-Cassandra-Token": ASTRA_DB_APPLICATION_TOKEN,
        "Content-Type": "application/json",
      },
    });

    if (response.ok) {
      const data = await response.json();
      console.log("Token is valid. Keyspaces:", data);
    } else {
      console.error(
        "Invalid token or other error:",
        response.status,
        response.statusText
      );
    }
  } catch (error) {
    console.error("Error checking token:", error);
  }
}

checkToken();
