const { OpenAI } = require("openai");
require("dotenv").config();

const chatGPT = async (userInput) => {
  const chatHistory = [];
  const openai = new OpenAI({
    apiKey: process.env.OPEN_AI_KEY,
  });
  console.log("chatGPT");
  const userInputGPT =
    "Please check if this sentence is correct, natural and properly structured. If not please provide the correction: " +
    userInput;
  console.log(userInputGPT);
  try {
    const messages = chatHistory.map(([role, content]) => ({
      role,
      content,
    }));

    messages.push({ role: "user", content: userInputGPT });

    const chatCompletion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: messages,
    });

    const gptReply = chatCompletion.choices[0].message.content;

    if (userInput.toLowerCase() === "exit") {
      console.log("Bot: " + gptReply);
      return;
    }

    console.log("Bot: " + gptReply);

    chatHistory.push(["user", userInput]);
    chatHistory.push(["assistant", gptReply]);
    return gptReply
  } catch (error) {
    console.log(error);
  }
};

exports.chatGPT = chatGPT;
