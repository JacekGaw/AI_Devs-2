//////////////BOILERPLATE//////////////////////////

import "dotenv/config";
import fs from "fs";
import OpenAI from "openai";
let archiveURL = "";
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

let token = "";

const response = async () => {
  try {
    const response = await fetch("https://tasks.aidevs.pl/token/md2html", {
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
    const input = task.input;
    const answer = await getAnswer(input);
    send(token, answer);
  } catch (e) {
    console.log(e);
  }
};

const getAnswer = async (query) => {
  try {
    const completion = await openai.chat.completions.create({
      model: process.env.TRAINED_MODEL,
      messages: [
        {
          role: "system",
          content:
          "Your task is to convert markdown format to html format. All markdown characters and naming convert to html elements but for \"bold\" or **pogrubienie** you have to return <span class=\"bold\">pogrubienie</span>. \nDictionary:\n# Naglowek1 - <h1>Naglowek1</h1>\n## Naglowek2 - <h2>Naglowek2</h2>\n### Naglowek3 - <h3>Naglowek3</h3>\n**pogrubienie** - <span class=\"bold\">pogrubienie</span>\n*kursywa* - <em>kursywa</em>\n[AI Devs 3.0](https://aidevs.pl) - <a href=\"https://aidevs.pl\">AI Devs 3.0</a>\n_podkreslenie_ - <u>podkreslenie</u>\n\nList:\n1. Element listy\n2. Kolejny elementy\n\nreturn:\n<ol>\n<li>Element listy</li>\n<li>Kolejny elementy</li>\n</ol>\n",
        },
        {
          role: "user",
          content: query
        }
      ],
    });
    const response = completion.choices[0].message.content;
    console.log(response);
    return response;
  } catch (err) {
    console.log(err);
  }
};

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
