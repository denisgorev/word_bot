const { Telegraf } = require("telegraf");
const { Scenes, Stage, session } = require("telegraf");
const voiceMode = require("./scenes/voice-scene");
const engMode = require("./scenes/eng-scene");
const wordsDataWizard = require("./scenes/dutch-words");
const wordsPhrasesWizard = require("./scenes/dutch-phrases");
const {
  allWordsCallArray,
  messageCompose,
} = require("./utils/general-functions");
const { chatGPT } = require("./utils/chat-gpt");

const bot = new Telegraf(process.env.TOKEN);

const wordBot = () => {
  bot.start((ctx) => {
    ctx.replyWithHTML(
      `Hi, ${ctx.from.first_name}! Let's learn some new words! Please select a mode from "menu". Please note it could take some time to start a session`
    );
  });

  bot.command("allwords", async (ctx) => {
    let text;
    try {
      text = await allWordsCallArray("output", "words");
    } catch (err) {
      console.log(err);
      process.exit(1);
    }
    const getKey = (str) => str.split(":")[0];

    // Sort the array by the key in alphabetical order
    const sortedData = text.sort((a, b) => getKey(a).localeCompare(getKey(b)));

    ctx.replyWithHTML(sortedData.join("").toString());
  });

  bot.command("allphrases", async (ctx) => {
    let text;
    try {
      text = await allWordsCallArray("output", "phrases");
    } catch (err) {
      console.log(err);
      process.exit(1);
    }
    ctx.replyWithHTML(text.join("").toString());
  });

  const studyPhrasesWizard = new Scenes.WizardScene(
    "phrase_training",
    async (ctx) => {
      ctx.replyWithHTML("Welcome to the sentences composing mode");

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
      
    },
    async (ctx) => {

      const userInput = ctx.message.text 
      const chatGPTResponse = await chatGPT(userInput)
      console.log(chatGPTResponse)
      await ctx.replyWithHTML(
        chatGPTResponse
      );
      console.log(userInput);
      
      
      return ctx.scene.leave();
    }
  );
  const stage = new Scenes.Stage([
    wordsDataWizard,
    wordsPhrasesWizard,
    engMode,
    voiceMode,
    studyPhrasesWizard
  ]);
  bot.use(session());
  bot.use(stage.middleware());
  bot.command("words", (ctx) => {
    ctx.scene.enter("words");
  });
  bot.command("phrases", (ctx) => {
    ctx.scene.enter("phrases");
  });
  bot.command("english", (ctx) => {
    ctx.scene.enter("english");
  });
  bot.command("voice", (ctx) => {
    ctx.scene.enter("voice");
  });
  bot.command("phrase_training", (ctx) => {
    ctx.scene.enter("phrase_training");
  });

  bot.launch();
};

exports.wordBot = wordBot;
