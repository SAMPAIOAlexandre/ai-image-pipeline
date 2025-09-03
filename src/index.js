import 'dotenv/config';
// import fs from 'fs';
// import path from 'path';
import  OpenAI  from 'openai';
import path from 'path';
import { fileURLToPath } from 'url';

// For ES Module, __dirname is not defined, so we need to create it manually
const __filename  = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Define paths
const outPutDir = path.join(__dirname, 'images');
const source_images = path.join(__dirname, 'main.png');




const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const response = await openai.responses.create({
  model: "gpt-5",
  input: "Write a short bedtime story about a unicorn.",
});

console.log(response.output_text);


