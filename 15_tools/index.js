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
    const response = await fetch("https://tasks.aidevs.pl/token/tools", {
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
    const question = task.question;
    const answer = await getDecisionJSON(question);
    send(token, answer);
  } catch (e) {
    console.log(e);
  }
};

const getDecisionJSON = async (question) => {
  let today = new Date();
  let year = today.getFullYear();
  let month = String(today.getMonth() + 1).padStart(2, "0"); // Months are zero indexed
  let day = String(today.getDate()).padStart(2, "0");
  let formattedDate = `${year}-${month}-${day}`;
  
  const completion = await openai.chat.completions.create({
    model: "gpt-3.5-turbo",
    response_format: {
      type: "json_object",
    },
    messages: [
      {
        role: "system",
        content: `You are assistant that will decide what to do base on provided user question. You have two tasks options.
        Tasks:
        1. Add to ToDo list,
        2. Add to the calendar.
        
        For adding to the calendar user have to provide date. If he do not provide it it will be task to add to Todo.
        You have to return JSON object. You have one format for every task that you can make
        
        Format for add to ToDo list:###
        {
          "tool":"ToDo",
          "desc":"...DESCRIPTION OF THE ADDED TODO..."
        }
        
        Format for add to the calendar: ###
        {
          "tool":"Calendar",
          "desc":"...DESCRIPTION OF THE EVENT TO CALENDAR...",
          "date":"date in format YYYY-MM-DD (today is ${formattedDate})
        }
        
        You have to strictly use those formats. "tool" values must be unchanged. Format of the date have to be unchanged.`,
      },
      {
        role: "user",
        content: question,
      },
    ],
  });

  const response = completion.choices[0].message.content;
  console.log(JSON.parse(response));
  return JSON.parse(response);
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
