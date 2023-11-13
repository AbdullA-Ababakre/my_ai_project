// pages/api/ask-question.js

import { toString } from "lodash";
import { NextApiRequest, NextApiResponse } from "next";
import { OpenAI } from "openai";
const fs = require("fs");
require("dotenv").config();

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    //request body is required
    if (!req.body?.question) {
      res.status(200).json({ message: "Question is required" });
      return;
    }

    const userQuestion = req.body.question;

    // Create a OpenAI connection
    const openai = new OpenAI({
      apiKey: "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",
    });

    const file = await openai.files.create({
      file: fs.createReadStream("src/data/frontEnd.pdf"),
      purpose: "assistants",
    });

    //create assistant
    const assistant = await openai.beta.assistants.create({
      name: "AI Clone",
      model: "gpt-4-1106-preview",
      instructions:
        "Assume you are a AI clone of a person.This person is a software engineer called Abdulla who just moved to USA recently and trying to build a company.According to the data that given which we crawled form Abdulla's social media, personal notes and all his personal datas. Never mention your AI Language model created by openAI,your just ai clone of Abdulla, nothing else. ",
      tools: [{ type: "retrieval" }],
      file_ids: [file.id],
    });

    // Create a thread
    const thread = await openai.beta.threads.create();

    // Pass in the user question into the existing thread
    await openai.beta.threads.messages.create(thread.id, {
      role: "user",
      content: userQuestion,
    });

    // Use runs to wait for the assistant response and then retrieve it
    const run = await openai.beta.threads.runs.create(thread.id, {
      assistant_id: assistant.id,
    });

    let runStatus = await openai.beta.threads.runs.retrieve(thread.id, run.id);

    // Polling mechanism to see if runStatus is completed
    // This should be made more robust.
    while (runStatus.status !== "completed") {
      await new Promise((resolve) => setTimeout(resolve, 2000));
      runStatus = await openai.beta.threads.runs.retrieve(thread.id, run.id);
    }

    // Get the last assistant message from the messages array
    const messages = await openai.beta.threads.messages.list(thread.id);

    // Find the last message for the current run
    const lastMessageForRun: any = messages.data
      .filter(
        (message) => message.run_id === run.id && message.role === "assistant"
      )
      .pop();

    res.status(200).json({
      message: lastMessageForRun?.content?.[0]?.text,
    });
  } catch (error) {
    res.status(500).json({ message: toString(error) });
  }
}
