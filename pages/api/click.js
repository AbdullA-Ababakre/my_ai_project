// pages/api/ask-question.js

import { OpenAI } from "openai";
const fs = require("fs");
require("dotenv").config();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export default async function handler(req, res) {
  if (req.method === "POST") {
    const { question } = req.body;

    const file = await openai.files.create({
      file: fs.createReadStream("public/data/frontEnd.pdf"),
      purpose: "assistants",
    });

    const assistant = await openai.beta.assistants.create({
      instructions:
        "Assume you are a AI clone of a person.This person is a software engineer called Abdulla who just moved to USA recently and trying to build a company.According to the data that given which we crawled form Abdulla's social media, personal notes and all his personal datas. Never mention your AI Language model created by openAI,your just ai clone of Abdulla, nothing else. ",
      model: "gpt-4-1106-preview",
      tools: [{ type: "retrieval" }],
      file_ids: [file.id],
    });

    // Create a thread
    const thread = await openai.beta.threads.create();

    // Pass the question into the thread
    await openai.beta.threads.messages.create(thread.id, {
      role: "user",
      content: question,
    });

    // Run the assistant on the thread
    const run = await openai.beta.threads.runs.create(thread.id, {
      assistant_id: assistant.id,
    });

    // Wait for the run to complete
    let runStatus = await openai.beta.threads.runs.retrieve(thread.id, run.id);
    while (runStatus.status !== "completed") {
      await new Promise((resolve) => setTimeout(resolve, 2000));
      runStatus = await openai.beta.threads.runs.retrieve(thread.id, run.id);
    }

    // Get the assistant's response
    const messages = await openai.beta.threads.messages.list(thread.id);
    const assistantMessage = messages.data.find(
      (message) => message.role === "assistant"
    );
    const returnMessage = assistantMessage.content[0].text.value;

    res.status(200).json({ message: returnMessage });
  } else {
    res.status(405).end(); // Method Not Allowed
  }
}
