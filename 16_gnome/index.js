//////////////BOILERPLATE//////////////////////////

import "dotenv/config";
import fs from "fs";
import OpenAI from "openai";
let archiveURL = "";
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
// import { TOOLS } from "./tools.js";

let token = "";
let db = [];

const response = async () => {
  try {
    const response = await fetch("https://tasks.aidevs.pl/token/gnome", {
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
    const photoUrl = task.url;
    const answer = await getAnswer(photoUrl);
    console.log(answer);
    send(token, answer);
  } catch (e) {
    console.log(e);
  }
};

const getAnswer = async (photoUrl) => {
  
  const completion = await openai.chat.completions.create({
    model: "gpt-4-turbo",
    messages: [
      {
        role: "user",
        content: [
          {
            type: "text",
            text: `Czy na tym zdjęciu jest gnom? Jeśli tak to jaki jest kolor jego czapki? Jeśli na obrazku nie ma gnoma zwróć tylko słowo error. Jeśli rozpoznasz kolor czapki zwróć tylko jej kolor`
          },
          {
            type: "image_url",
            image_url: {
              "url": photoUrl
            }
          }
        ]
      }
    ],
  });

  const response = completion.choices[0].message.content;
  return response;
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
