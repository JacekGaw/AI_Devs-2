//////////////BOILERPLATE//////////////////////////

import "dotenv/config";
import OpenAI from "openai";
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

let token = "";

const response = async () => {
  try {
    const response = await fetch("https://tasks.aidevs.pl/token/inprompt", {
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
    const sentences = task.input;
    const question = task.question;
    console.log(question);
    const name = await getName(question);
    console.log(name);
    const filteredSentences = sentences.filter((sentence) => sentence.includes(name));
    console.log(filteredSentences);
    const answer = await getAnswer(question, filteredSentences);
    console.log(answer);
    send(token, answer);
  } catch (e) {
    console.log(e);
  }
};

const getAnswer = async (question, sentences) => {
    try {
        const completion = await openai.chat.completions.create({
          messages: [
            {
              role: "system",
              content:
                `Jestem asystentem, który odpowiada na pytania zawarte w kontekście. Moja wiedza ogranicza się tylko do kontekstu jaki został mi nadany. 
                
                ~~~Context~~~
                ${sentences.map(sentence => sentence)}
                ~~~Context End~~~
                `,
            },
            { role: "user", content: question },
          ],
          model: "gpt-3.5-turbo",
        });
        return completion.choices[0].message.content;
      } catch (e) {
        console.log(e);
      }
}

const getName = async (question) => {
  try {
    const completion = await openai.chat.completions.create({
      messages: [
        {
          role: "system",
          content:
            "Jesteś asystentem, który zwraca tylko imię napotkane w zdaniu. Nic innego, nie potrzebuję reszty zdania. Zwróć jedno słowo które ma być imieniem napotkanym w zdaniu.",
        },
        { role: "user", content: question },
      ],
      model: "gpt-3.5-turbo",
    });
    return completion.choices[0].message.content;
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
