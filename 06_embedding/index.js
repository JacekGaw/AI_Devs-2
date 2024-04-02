//////////////BOILERPLATE//////////////////////////

import "dotenv/config";
import OpenAI from "openai";
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

let token = "";

const response = async () => {
  try {
    const response = await fetch("https://tasks.aidevs.pl/token/embedding", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ apikey: process.env.AIDEVS_API_KEY }),
    });
    const data = await response.json();
    token = data.token;
    getMethod(token);
  } catch (e) {
    console.log(e);
  }
};

const getMethod = async (token) => {
  try {
    const response = await fetch(`https://tasks.aidevs.pl/task/${token}`, {
      method: "GET",
    });
    const task = await response.json();
    console.log(task);
    const sentence = "Hawaiian Pizza";
    const embeddings = await getEmbeddings(sentence);
    const answer = embeddings;
    send(token, answer);
  } catch (e) {
    console.log(e);
  }
};

const getEmbeddings = async (sentence) => {
  try {
    const embedding = await openai.embeddings.create({
      model: "text-embedding-ada-002",
      input: sentence,
      encoding_format: "float",
    });

    return embedding.data[0].embedding;
  } catch (e) {
    console.log(e);
  }
};


const send = async (token, answer) => {
    try {
        const response = await fetch(`https://tasks.aidevs.pl/answer/${token}`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ answer: answer })
        });
        const taskMsg = await response.json();
        console.log(taskMsg);
    }
    catch (e) {console.log(e)}
}

response();
// getMethod();

// console.log(response);
