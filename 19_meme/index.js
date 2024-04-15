//////////////BOILERPLATE//////////////////////////

import "dotenv/config";
let token = "";

const response = async () => {
  try {
    const response = await fetch("https://tasks.aidevs.pl/token/meme", {
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
    const memeImgUrl = task.image;
    const memeText = task.text;
    const answer = await generateMeme(memeImgUrl, memeText);
    send(token, answer);
  } catch (e) {
    console.log(e);
  }
};

const generateMeme = async (memeImgUrl, memeText) => {
  const body = {
    template: "drunk-basilisks-whisper-often-1673",
    data: {
      "title.text": memeText,
      "image.src": memeImgUrl,
    },
  };
  try {
    const response = await fetch("https://get.renderform.io/api/v2/render?output=json", {
      method: "POST",
      headers: {
        'x-api-key': process.env.RENDERFORM_API_KEY,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });
    if(!response.ok){
      throw new Error( response.statusText);
    }
    const data = await response.json();
    return data.href;
  } catch (err) {
    console.log(err);
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
