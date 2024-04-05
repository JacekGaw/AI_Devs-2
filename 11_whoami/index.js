//////////////BOILERPLATE//////////////////////////

import "dotenv/config";
import fs from "fs";
import OpenAI from "openai";
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

let token = "";
const dataSet = [];

const response = async () => {
  try {
    const response = await fetch("https://tasks.aidevs.pl/token/whoami", {
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
    console.log(task.hint);
    let hint = task.hint;
    dataSet.push(hint);
    console.log(dataSet);
    const resp = await getAnswer();
    // const answer = ""
    // console.log(answer);
    // send(token, answer);
  } catch (e) {
    console.log(e);
  }
};

const getAnswer = async () => {
  try {
    const completion = await openai.chat.completions.create({
      messages: [
        {
          role: "system",
          content: `Using only knowledge from user message, gues who is the described person. This person have name and surname. You return objects in JSON
          with response. You can only use formats:
          - when you don't know who the person is:
          { response: NO }

          - if you are sure know who the person is:
          { response: YES, person: "name of the person"}
           
          Do not add another things to this formats. Use strictly only them`,
        },
        { role: "user", content: `${dataSet.map(item => item)}` },
      ],
      model: "gpt-3.5-turbo",
      response_format: { type: "json_object" },
    });
    const responseJSON = JSON.parse(completion.choices[0].message.content);
    const response = responseJSON["response"];
    if(response.toLowerCase() === "no") {
      getMethod(token);
    }
    if(response.toLowerCase() === "yes") {
      const person = responseJSON["person"];
      console.log(person);
      send(token, person);
    }
    console.log(response);
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
