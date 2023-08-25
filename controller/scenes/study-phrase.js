const { Scenes } = require("telegraf");
const { chatGPT } = require("../utils/chat-gpt");
const { messageCompose } = require("../utils/general-functions");

const stepCount = 5; // Total number of steps

const createStep = async (ctx, repeatWelcome) => {
  if (repeatWelcome) {
    ctx.replyWithHTML("Welcome to the sentences composing mode. Please note that ChatGPT will review your answers and it takes some time for it to prepare the response.");
  }

  try {
    responseFinal = await messageCompose(ctx, [], true, "english");
  } catch (err) {
    console.log(err);
  }
  const index = responseFinal[1];
  const shownWord = responseFinal[2][index][0];

  ctx.replyWithHTML(
    `Please compose a sentence with the following word: <b>${shownWord}</b>`
  );

  return ctx.wizard.next();
};

const studyPhrasesWizard = new Scenes.WizardScene(
  "phrase_training",
  (ctx) => createStep(ctx, true),
  ...Array(stepCount - 1).fill(async (ctx) => {
    const userInput = ctx.message.text;
    const chatGPTResponse = await chatGPT(userInput);
    console.log(chatGPTResponse);
    await ctx.replyWithHTML(chatGPTResponse);
    return createStep(ctx, false);
  }),
  async (ctx) => {
    const userInput = ctx.message.text;
    const chatGPTResponse = await chatGPT(userInput);
    await ctx.replyWithHTML(chatGPTResponse);
    console.log(userInput, 'last iteration');
    ctx.replyWithHTML(`Great job! The session is finished`);
    return ctx.scene.leave();
  }
);

module.exports = studyPhrasesWizard;