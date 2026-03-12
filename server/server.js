import express from "express";
import OpenAI from "openai";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// health check route
app.get("/", (req, res) => {
  res.send("AI server is running");
});



app.post("/analyze", async (req, res) => {

  try {

    const article = req.body.article.slice(0, 8000);

    console.log("Article length:", article.length);

    const prompt = `
You are a German language teacher helping a learner progress from B1 to B2.

Task:
Analyze a German news article and extract useful vocabulary.

Return ONLY valid JSON.

All Chinese explanations must use Traditional Chinese.

JSON structure:

{
  "vocabulary": [
    {
      "word": "",
      "part_of_speech": "",
      "meaning_chinese": "",
      "usage_explanation": "",
      "common_collocation": "",
      "example_sentence": ""
    }
  ]
}

Vocabulary rules:

Select exactly 10 useful B2-level words.

Prefer vocabulary from:
- news
- politics
- economics
- society

Avoid very basic A1–B1 words.

Word format rules:

1. If the word is a noun:
Include article + plural form.

Examples:
"die Grenze, -n"
"der Regierungschef, -s"
"das Ergebnis, -se"

2. If the word is a verb:

Write the part_of_speech field like this:

Verb: Präsens3 – Präteritum3 – Perfekt3

Where:

Präsens3 = third person singular present  
Präteritum3 = third person singular preterite  
Perfekt3 = third person singular perfect

Example:

word: "verschärfen"

part_of_speech:
"Verb: verschärft – verschärfte – hat verschärft"

3. If the word is not a noun or verb:

part_of_speech must be one of:

Adjektiv
Adverb

Example entry:

{
  "word": "verschärfen",
  "part_of_speech": "Verb: verschärft – verschärfte – hat verschärft",
  "meaning_chinese": "加劇，惡化",
  "usage_explanation": "常用於描述政策或衝突變得更加嚴格或激烈。",
  "common_collocation": "Politik verschärfen",
  "example_sentence": "Die Regierung hat die Einwanderungspolitik verschärft.（政府加強了移民政策。）"
}

Example sentence rule:

German sentence + Chinese translation in parentheses.

Article:

<article>
${article}
</article>
`;

    const response = await client.chat.completions.create({
      model: "gpt-4.1-mini",
      temperature: 0.2,
      response_format: {
        type: "json_object"
      },

      messages: [

        {
          role: "system",
          content: "You are a German language learning assistant. Always return valid JSON."
        },
        {
          role: "user",
          content: prompt
        }
      ]
    });

    const content = response.choices[0].message.content;

    res.json({ result: content });

  } catch (error) {

    console.error(error);

    res.status(500).json({
      error: "AI analysis failed"
    });

  }

});

app.listen(3000, () => {
  console.log("Server running on http://localhost:3000");
});