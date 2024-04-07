//////////////BOILERPLATE//////////////////////////

import "dotenv/config";
import fs from "fs";
import OpenAI from "openai";
import { uuid } from "uuidv4";
import {QdrantClient} from '@qdrant/js-client-rest';
const archiveURL = 'https://unknow.news/archiwum_aidevs.json';
const qdrant = new QdrantClient({url: process.env.QDRANT_URL});
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

let token = "";
const dataSet = [];
let query = '';
let queryEmbedding = '';

const result = await qdrant.getCollections();
const indexed = result.collections.find((collection) => collection.name === 'ai_devs_search2');

//create collection if it is not exist
if (!indexed) {
  await qdrant.createCollection('ai_devs_search2', { vectors: { size: 1536, distance: 'Cosine', on_disk: true }});
}

const collectionInfo = await qdrant.getCollection('ai_devs_search2');

//index documents if they are not indexed
if(!collectionInfo.points_count) {

  //get data from archiveURL
  const response = await fetch(archiveURL);
  const files = await response.json();
  let documents = files;

  //Add metadata
  documents = documents.map((document) => {
    document.metadata = {
      url: document.url,
      info: document.info,
      title: document.title,
      uuid: uuid()
    };
    return document;
  });

  //generate embedding and create full object array
  const objToAdd = [];
  for(const document of documents){
    const embedding = await getEmbedding(document['info']);
    objToAdd.push({
      id: document.metadata.uuid,
      payload: document.metadata,
      vector: embedding
    })
  }
  
  //index to qdrant
  await qdrant.upsert('ai_devs_search2', {
    wait: true,
    batch: {
        ids: objToAdd.map((obj) => (obj.id)),
        vectors: objToAdd.map((obj) => (obj.vector)),
        payloads: objToAdd.map((obj) => (obj.payload)),
    },
})
}

const response = async () => {
  try {
    const response = await fetch("https://tasks.aidevs.pl/token/search", {
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
    query = task.question;
    queryEmbedding = await getEmbedding(query);

    //qdrant search
    const search = await qdrant.search('ai_devs_search2', {
      vector: queryEmbedding,
      limit: 1
    })
    const answer = search[0].payload.url;
    send(token, answer);
  } catch (e) {
    console.log(e);
  }
};

async function getEmbedding(queryToEmbed) {
  const embedding = await openai.embeddings.create({
    model: 'text-embedding-3-small',
    input: queryToEmbed,
  });
  return embedding.data[0].embedding;
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

