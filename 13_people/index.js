//////////////BOILERPLATE//////////////////////////

import "dotenv/config";
import fs from "fs";
import OpenAI from "openai";
let archiveURL = "";
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

let token = "";
let db = [];

const response = async () => {
  try {
    const response = await fetch("https://tasks.aidevs.pl/token/people", {
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
    archiveURL = task.data;
    getDB(archiveURL);
    const question = task.question;
    const query = await getImportantData(question);
    const answer = await getAnswer(JSON.parse(query));
    send(token, answer);
  } catch (e) {
    console.log(e);
  }
};

async function getImportantData(question) {
  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content: `From given question in polish i want you to extract the person name and surname and put it into property "person". Get name but convert it to oficial form. For example Kysia convert to Krystyna
      Then i want you to return the whole given question in not changed form in property "question". Return JSON object only.
      
      example.....
      question: Jaki jest ulubiony kolor Karolka Kowalskiego?
      answer: {
        person: "Karol Kowalski",
        question: "Jaki jest ulubiony kolor Karola Kowalskiego?"
      }
      `,
        },
        {
          role: "user",
          content: question,
        },
      ],
    });
    const response = completion.choices[0].message.content;
    return response;
  } catch (err) {
    console.log(err);
  }
}

async function getDB() {
  try {
    const response = await fetch(archiveURL);
    if (!response.ok) {
      throw new Error(response);
    }
    db = await response.json();
    simplifyDB();
  } catch (e) {
    console.log(e);
  }
}

function simplifyDB() {
  const reducedDB = db.map((item) => ({
    osoba: `${item.imie} ${item.nazwisko}`,
    o_mnie: item.o_mnie,
    ulubiony_kolor: item.ulubiony_kolor,
  }));
  db = reducedDB;
}

async function getAnswer(query) {
  try {
    const personData = db.filter((item) => item.osoba === query.person);
    if(personData.length === 0) {
      throw new Error("not find");
    }
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: `Answer provided question using only knowledge from the context below
          
          context###
          ${personData[0].osoba}
          ${personData[0].o_mnie}
          ${personData[0].ulubiony_kolor}
          ###`
        },
        {
          role: "user",
          content: query.question,
        },
      ],
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
