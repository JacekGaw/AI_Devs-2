// const response = requests.post("https://tasks.aidevs.pl/task/(Adres z tokenu)", json={"answer": "(cookie)"})
import 'dotenv/config';
import OpenAI from "openai";
const openai = new OpenAI({apiKey: process.env.OPENAI_API_KEY});

let token = '';

const response = async () => {
    try {
        const response = await fetch("https://tasks.aidevs.pl/token/moderation", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ apikey: process.env.AIDEVS_API_KEY })
        });
        const data = await response.json();
        console.log(data);
        token = data.token;
        getMethod(token);
    }
    catch (e) {console.log(e)}

}


const getMethod = async (token) => {
    try {
        const response = await fetch(`https://tasks.aidevs.pl/task/${token}`, {
            method: "GET",
        });
        const data = await response.json();
        console.log(data);
        const answer = await moderateArray(data.input);
        console.log(answer);
        send(token, answer);
    }
    catch (e) {console.log(e)}
}

const moderateArray = async (array) => {
    let result = [];
    try {
        for(const element in array){
            console.log(array[element]);
            const moderation = await openai.moderations.create({ input: array[element] });
            console.log(moderation.results[0].flagged);
            if(moderation.results[0].flagged){
                result.push(1);
            }
            else result.push(0)
        }

        return result;
    } catch (e) {console.log(e);}
}

const send = async (token, answer) => {
    try {
        const response = await fetch(`https://tasks.aidevs.pl/answer/${token}`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ answer })
        });
        const data = await response.json();
        console.log(data);
        // token = data.token;
    }
    catch (e) {console.log(e)}
}

response();
// getMethod();

// console.log(response);