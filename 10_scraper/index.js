//////////////BOILERPLATE//////////////////////////

import "dotenv/config";
import fs from "fs";
import OpenAI from "openai";
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

let token = "";

const response = async () => {
  try {
    const response = await fetch("https://tasks.aidevs.pl/token/scraper", {
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
    const question = task.question;
    // scraper(input);
    const answer = await getArticle(input, question);
    console.log(answer);
    send(token, answer);
  } catch (e) {
    console.log(e);
  }
};

const getArticle = async (fileURL, question) => {
  try {
    const response = await fetch(fileURL, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "User-Agent":
          "Mozilla/5.0 (platform; rv:geckoversion) Gecko/geckotrail Firefox/firefoxversion",
      },
    });
    if (!response.ok) {
      throw new Error();
    }
    const data = await response.text();
    return await getAnswer(data, question);
  } catch (err) {
    return err;
  }
};

const getAnswer = async (context, question) => {
  try {
    const completion = await openai.chat.completions.create({
      messages: [
        {
          role: "system",
          content: `You only answer in Polish. You can only use knowledge from context. Speak briefly.
            
            ###context
            ${context}
            ###
            `,
        },
        { role: "user", content: question },
      ],
      model: "gpt-3.5-turbo",
    });
    return completion.choices[0].message.content;
  } catch (err) {
    return err;
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
// getMethod();

// console.log(response);
