// const response = requests.post("https://tasks.aidevs.pl/task/(Adres z tokenu)", json={"answer": "(cookie)"})
import "dotenv/config";
import OpenAI from "openai";
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

let token = "";

const response = async () => {
  try {
    const response = await fetch("https://tasks.aidevs.pl/token/blogger", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ apikey: process.env.AIDEVS_API_KEY }),
    });
    const data = await response.json();
    console.log(data);
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
    const data = await response.json();
    console.log(data);
    const answer = await writeBlog(data.blog);
    console.log(answer);
    send(token, answer);
  } catch (e) {
    console.log(e);
  }
};

const writeBlog = async (array) => {
  let result = [];
  try {
    for (const element in array) {
      const completion = await openai.chat.completions.create({
        messages: [
          {
            role: "system",
            content:
              "Jesteś blogerem piszącym po polsku. Użytkownik wprowadzi nazwę rozdziału, a Ty musisz napisać do tego tekst",
          },
          { role: "user", content: array[element] },
        ],
        model: "gpt-3.5-turbo",
      });

      console.log(completion.choices[0].message.content);
      result.push(completion.choices[0].message.content);
    }

    return result;
  } catch (e) {
    console.log(e);
  }
};

const send = async (token, answer) => {
  try {
    const response = await fetch(`https://tasks.aidevs.pl/answer/${token}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ 'answer': [...answer] }),
    });
    const data = await response.json();
    console.log(data);
    // token = data.token;
  } catch (e) {
    console.log(e);
  }
};

response();
// getMethod();

// console.log(response);
