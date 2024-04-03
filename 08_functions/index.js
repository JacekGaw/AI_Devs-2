//////////////BOILERPLATE//////////////////////////

import "dotenv/config";
import fs from "fs";
import OpenAI from "openai";
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

let token = "";

const response = async () => {
  try {
    const response = await fetch("https://tasks.aidevs.pl/token/functions", {
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
    const answer = {
        "name": "addUser",
        "description": "add user to database using name, surname, year of birth",
        "parameters": {
          "type": "object",
          "properties": {
            "name": {
              "type": "string",
              "description": "name of a person to add"
            },
            "surname": {
              "type": "string",
              "description": "surname of a person to add"
            },
            "year": {
              "type": "integer",
              "description": "year of birth of a person to add"
            }
          }
        }
    };
    send(token, answer);
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
