//////////////BOILERPLATE//////////////////////////

import "dotenv/config";
import fs from "fs";
import OpenAI from "openai";
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

let token = "";

const response = async () => {
  try {
    const response = await fetch("https://tasks.aidevs.pl/token/whisper", {
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
    const answer = await getTranscription();
    send(token, answer);
  } catch (e) {
    console.log(e);
  }
};

const getTranscription = async () => {
  try {
    const transcription = await openai.audio.transcriptions.create({
      file: fs.createReadStream("./mateusz.mp3"),
      model: "whisper-1",
    });
  
    console.log(transcription.text);
    return transcription.text;
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
