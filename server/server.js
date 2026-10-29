
import express from "express";
import OpenAI from "openai";
import dotenv from "dotenv";
import cors from "cors";

dotenv.config({ path: new URL("./.env", import.meta.url) });

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

app.get("/", (req, res) => {
  res.send("SkillBridge AI Backend is running!");
});

app.post("/api/analyze", async (req, res) => {
  console.log("Received AI analysis request");
  try {
    const { resume, jobDescription } = req.body;

    if (!resume?.trim() || !jobDescription?.trim()) {
      return res.status(400).json({
        error: "Resume and job description are required.",
      });
    }

    const response = await client.responses.create({
      model: "gpt-4.1-mini",
      input: `You are a helpful AI career mentor.

Compare this resume with the job description.

RESUME:
${resume}

JOB DESCRIPTION:
${jobDescription}

Give a clear report in simple English:
1. Resume strengths
2. Relevant skills found
3. Missing skills
4. Resume improvement suggestions
5. Three next steps

Do not invent skills, experience, or qualifications.`,
    });

    res.json({
      result: response.output_text,
    });
  } catch (error) {
    console.error("OpenAI error:", error.status, error.code, error.message);

    res.status(500).json({
      error: `AI analysis failed (${error.status || "unknown"}): ${
        error.message || "Check server configuration."
      }`,
    });
  }
});

app.listen(PORT, () => {
  console.log(`Backend running at http://localhost:${PORT}`);
});
