import 'dotenv/config';
import { createReadStream } from 'fs';
import fs from 'fs/promises';
import  OpenAI  from 'openai';
import { toFile } from 'openai/uploads';
import path from 'path';
import { fileURLToPath } from 'url';

// For ES Module, __dirname is not defined, so we need to create it manually
const __filename  = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Define paths
const outputDir = path.join(__dirname, 'images');
const sourceImage = path.resolve(__dirname, '..', 'main.png');
console.log(outputDir);
console.log(sourceImage);

const scenes = [
  "Ce mec, c'est le boss de la tech.",
  "Il a révolutionné l'industrie avec ses idées innovantes.",
  "Toujours à la pointe de la technologie, il inspire toute une génération.",
  "Son influence s'étend bien au-delà de la Silicon Valley.",
  "Un véritable visionnaire, il façonne l'avenir avec passion et détermination."
]

function buildPrompt(sceneText) {
  return (`
    You are generating an image for a specific scene of a story about:
    Steve Jobs, an American businessman, inventor, and investor best known for co-founding the technology company Apple Inc.
    Each image must be in an old school, serious, dark, and epic anime style.
    Use the main character of the image only when necessary, otherwise create a scene with objects, backgrounds, texts, or anything relevant to the scene in the overall story.
    Use objects, landscapes, portraits, and other elements to create a rich and detailed image depending on the scene.
    Use text only if the scene requires it.

    Scene: ${sceneText}
    `.trim());
  }
  
  // console.log(buildPrompt(scenes[0]));


const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// check if output directory exists, if not create it
await fs.mkdir(outputDir, { recursive: true });  

await assertSourceImage();

// check if source image exists
async function assertSourceImage() {
try {
  await fs.access(sourceImage);
} catch {
  console.error('❌ main.png introuvable :', sourceImage);
}
}



const bytes = await fs.readFile(sourceImage);

const imageFile = await toFile(bytes, 'main.png', { type: 'image/png' });



async function generateImage(scene, index) {
  const prompt = buildPrompt(scene);
  const i = index + 1; // unique file per scene 
  const size = "1024x1536";

  const res = await openai.images.edit({
    model: 'gpt-image-1',
    image: imageFile,
    prompt,
    size,
  });

  console.timeEnd(`API images.edit #${index + 1}`);
  console.log('   api result items:', Array.isArray(res.data) ? res.data.length : 0);


  // recover b64_json from response
  const b64 = res.data?.[0]?.b64_json;
  console.log('   b64 length:', b64?.length ?? 0);
  // if b64 is undefined, throw error
  if (!b64) throw new Error('No b64_json in response');

  // convert b64 to buffer and write to file
  const buffer = Buffer.from(b64, 'base64');
  // construct filename with unique name
  const filename = path.join(outputDir, `image-${index + 1}.png`);
  // write buffer to file in async
  await fs.writeFile(filename, buffer);
  console.log(`✅ saved → ${filename} (${buffer.byteLength} bytes)`);



  return { ok: true, file: filename, size };

}

try {
  const res1 = await generateImage(scenes[0], 0);
  console.log('SUMMARY:', res1);
} catch (e) {
  console.error('❌ generation failed:', e?.message || e);
}



// const response = await openai.responses.create({
//   model: "gpt-5",
//   input: "Write a short bedtime story about a unicorn.",
// });

// console.log(response.output_text);


