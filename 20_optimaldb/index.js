//////////////BOILERPLATE//////////////////////////

import "dotenv/config";
let token = "";
import OpenAI from "openai";
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const response = async () => {
  try {
    const response = await fetch("https://tasks.aidevs.pl/token/optimaldb", {
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
    const databaseUrl = task.database;
    const answer = await optimizeDb(databaseUrl);
    send(token, answer);
  } catch (e) {
    console.log(e);
  }
};

const optimizeDb = async (databaseUrl) => {
  try {
    const response = await fetch(databaseUrl);
    if(!response.ok){
      throw new Error(response.statusText);
    }
    const data = await response.json();
    
    const summary = await optimizeEachOne(JSON.stringify(data));
    console.log(summary);
    return summary;
  } catch (err) {
    console.log(err);
  }
}


const optimizeEachOne = async (database) => {
  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: `Użytkownik poda listę informacji o trzech osobach. Twoim zadaniem jest zwrócić te listy z wszystkimi podanymi informacjami ale ze skróconymi zdaniami. Nie zmieniaj struktury.
          `
        },
        {
          role: 'user',
          content: `${database}`
        }
      ]
    });
    const response = completion.choices[0].message.content;
    console.log(response);
    return response;
  } catch (err) {
    console.log(err);
  }
}

const send = async (token, answer) => {
  try {
    const response = await fetch(`https://tasks.aidevs.pl/answer/${token}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ answer: answer }),
    });
    const taskMsg = await response.json();
    console.log(taskMsg);
  } catch (e) {
    console.log(e);
  }
};

response();
