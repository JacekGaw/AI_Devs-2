//////////////BOILERPLATE//////////////////////////

import "dotenv/config";
import fs from "fs";
import OpenAI from "openai";
let archiveURL = "";
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
import { TOOLS } from "./tools.js";

let token = "";
let db = [];

const response = async () => {
  try {
    const response = await fetch("https://tasks.aidevs.pl/token/knowledge", {
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
    const answer = await runConversation(question);
    console.log(answer);
    send(token, answer);
  } catch (e) {
    console.log(e);
  }
};

async function runConversation(question) {
  const messages = [{
    role: 'user',
    content: question
  }]
  const response = await openai.chat.completions.create({
    model: "gpt-3.5-turbo",
    messages: messages,
    tools: TOOLS,
    tool_choice: "auto", // auto is default, but we'll be explicit
  });
  const responseMessage = response.choices[0].message;

    // Step 2: check if the model wanted to call a function
  const toolCalls = responseMessage.tool_calls;

  if(responseMessage.tool_calls){
    const availableFunctions = {
      get_exchange_rate: getCurrency,
      get_population: getPopulation,
      get_general_answer: generalKnowledge
    }
    messages.push(responseMessage);
    for (const toolCall of toolCalls) {
      const functionName = toolCall.function.name;
      const functionToCall = availableFunctions[functionName];
      const functionArgs = JSON.parse(toolCall.function.arguments);
      const functionResponse = await functionToCall(
        Object.values(functionArgs)[0]
      );
      return functionResponse;

//DALSZA CZĘŚĆ TO WYSŁANIE ODPOWIEDZI FUNKCJI DO CZATU W CELU ZREDAGOWANIA ODPOWIEDZI

      // messages.push({
      //   tool_call_id: toolCall.id,
      //   role: "tool",
      //   name: functionName,
      //   content: functionResponse,
      // }); // extend conversation with function response
    }
    // console.log(messages);
    // const secondResponse = await openai.chat.completions.create({
    //   model: "gpt-3.5-turbo",
    //   messages: messages,
    // }); // get a new response from the model where it can see the function response
    // return secondResponse.choices[0].message.content;
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

async function getCurrency(currencyCode) {
  try {
    const response = await fetch(
      `http://api.nbp.pl/api/exchangerates/rates/A/${currencyCode}?format=json`,
      {
        method: "GET",
      }
    );
    const data = await response.json();
    const exchangeRate = data.rates[0]?.mid;
    return exchangeRate ? exchangeRate.toString() : "Exchange rate data not available";
  } catch (err) {
    console.log(err);
    return "Error fetching exchange rate data";
  }
}

async function generalKnowledge(query) {
  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "Jesteś asystentem odpowiadającym na pytania z wiedzy ogólnej. Odpowiadaj krótko po polsku"
        },
        {
          role: "user",
          content: query,
        },
      ],
    });
    const response = completion.choices[0].message.content;
    return response;
  } catch (err) {
    console.log(err);
  }
}

async function getPopulation(country) {
  try {
    const response = await fetch(
      `https://restcountries.com/v3.1/name/${country}`,
      {
        method: "GET",
      }
    );
    const data = await response.json();
    const population = data[0].population;
    return population ? population.toString() : "Population data not available"
  } catch (err) {
    console.log(err);
    return "Error fetching population data";
  }
}

response();
