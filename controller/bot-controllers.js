const { Telegraf } = require("telegraf");
const { call } = require("../google-engine/google-api");
const { yesNoKeyboard } = require("../utils/keyboards");
const { Scenes, Stage, session } = require("telegraf");

const bot = new Telegraf(process.env.TOKEN);
let text = "";

function subtractArrays(array1, array2) {
  const set2 = new Set(array2);
  const result = array1.filter(([word]) => !set2.has(word));
  return result;
}

function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

const getRandomInt = (min, max) => {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

const numberGen = (length, outputText) => {
  let number_new;

  number_new = getRandomInt(1, length);

  return outputText[number_new];
};

const messageCompose = async (minus = []) => {
  let response;
  const arrayButtons = [];
  try {
    response = await allWordsCallArray("array");
    text = subtractArrays(response, minus);
    // console.log(text);
  } catch (err) {
    console.log(err);
    process.exit(1);
  }

  let length = text.length - 1;

  let number = getRandomInt(1, length);
  arrayButtons.push(text[number][1]);
  let lengthAnswers = response.length - 2;
  let responseAnswers = response;
  let finalText = text[number]; //only for test purposes
  // console.log(finalText) //only for test purposes

  for (let i = 1; i < 3; i++) {
    responseAnswers = subtractArrays(responseAnswers, finalText);
    // console.log(responseAnswers);
    // console.log(lengthAnswers);
    finalText = numberGen(lengthAnswers, responseAnswers);
    // console.log(finalText);
    arrayButtons.push(finalText[1]);
    lengthAnswers = lengthAnswers - 1;
    // responseAnswers = subtractArrays(responseAnswers, finalText);
  }
  let arrayButtonsFinal = shuffleArray(arrayButtons);
  return [arrayButtonsFinal, number, text];
};

const allWordsCallArray = async (mode) => {
  let response;
  let wordArray;

  try {
    response = await call();
    wordArray = response.values;
  } catch (err) {
    console.log(err);
  }
  text = [];
  if (mode == "output") {
    for (i in wordArray) {
      if (i != 0) {
        let value = "";
        value = wordArray[i][0] + ": " + wordArray[i][1] + " \n";
        text.push(value);
      }
    }
    return text;
  }
  if (mode == "array") {
    return wordArray;
  }
};

const wordBot = () => {
  bot.start((ctx) => {
    ctx.replyWithHTML(`Привет, ${ctx.from.first_name}! Давай изучать слова!`);
  });

  bot.command("allwords", async (ctx) => {
    let text;
    try {
      text = await allWordsCallArray("output");
    } catch (err) {
      console.log(err);
      process.exit(1);
    }
    ctx.replyWithHTML(text.join("").toString());
  });

  const wordBotInteraction = async (ctx) => {
    if (ctx.callbackQuery.data === "exit") {
      ctx.reply(`You left the learning mode`);
      return ctx.scene.leave();
    }
    if (ctx.callbackQuery === undefined) {
      ctx.reply(`You should select an option`);
      return;
    }
    if (ctx.callbackQuery === "exit") {
      return ctx.scene.leave();
    }

    if (ctx.callbackQuery.data == ctx.wizard.state.data) {
      ctx.reply("Correct!");
    } else {
      ctx.reply("Incorrect! Try one more time");
      return;
    }

    let newArray = ctx.wizard.state.array;
    let responseFinal;
    try {
      responseFinal = await messageCompose(newArray);
    } catch (err) {
      console.log(err);
    }

    let number = responseFinal[1];
    ctx.wizard.state.data = text[number][1];
    ctx.wizard.state.array = newArray.concat([
      text[number][0],
      text[number][1],
    ]);
    // console.log(ctx.wizard.state.array);
    ctx.replyWithHTML(
      `What does <b>${text[number][0]}</b> mean?`,
      yesNoKeyboard(responseFinal[0])
    );

    return ctx.wizard.next();
  };

  const wordsDataWizard = new Scenes.WizardScene(
    "words",
    async (ctx) => {
      let responseFinal;
      try {
        responseFinal = await messageCompose();
      } catch (err) {
        console.log(err);
      }
      let number = responseFinal[1];
      ctx.wizard.state.data = text[number][1];
      ctx.wizard.state.array = [text[number][0], text[number][1]];
      ctx.replyWithHTML(
        `What does <b>${text[number][0]}</b> mean?`,
        yesNoKeyboard(responseFinal[0])
      );
      return ctx.wizard.next();
    },
    async (ctx) => {
      try {
        await wordBotInteraction(ctx);
      } catch (err) {
        console.log(err);
      }
    },
    async (ctx) => {
      try {
        await wordBotInteraction(ctx);
      } catch (err) {
        console.log(err);
      }
    },
    async (ctx) => {
      try {
        await wordBotInteraction(ctx);
      } catch (err) {
        console.log(err);
      }
    },
    async (ctx) => {
      try {
        await wordBotInteraction(ctx);
      } catch (err) {
        console.log(err);
      }
    },
    async (ctx) => {
      if (ctx.callbackQuery.data == ctx.wizard.state.data) {
        ctx.reply("Correct! Good Job");
      } else {
        ctx.reply("Incorrect! Try one more time");
        return;
      }
      return ctx.scene.leave();
    }
  );

  const stage = new Scenes.Stage([
    wordsDataWizard,
    // startDataWizard,
  ]);
  bot.use(session());
  bot.use(stage.middleware());
  bot.command("words", (ctx) => {
    ctx.scene.enter("words");
  });

  bot.launch();
};

exports.wordBot = wordBot;
