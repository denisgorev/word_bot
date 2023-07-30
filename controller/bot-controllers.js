const { Telegraf } = require("telegraf");
const { call } = require("../google-engine/google-api");
const { yesNoKeyboard } = require("../utils/keyboards");
const { Scenes, Stage, session } = require("telegraf");
const { sessionGenerator } = require("./session-generator");

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

const messageComposeType = async (minus = [], reg = true, type = "words") => {
  console.log(type);
  let response;

  try {
    response = await allWordsCallArray("array", type);
    text = subtractArrays(response, minus);
  } catch (err) {
    console.log(err);
    process.exit(1);
  }

  let length = text.length - 1;
  let number = getRandomInt(1, length);

  return [number, text];
};

const messageCompose = async (minus = [], reg = true, type = "words") => {
  let response;
  const arrayButtons = [];
  try {
    response = await allWordsCallArray("array", type);
    text = subtractArrays(response, minus);
  } catch (err) {
    console.log(err);
    process.exit(1);
  }

  let length = text.length - 1;
  let number = getRandomInt(1, length);
  if (reg) {
    arrayButtons.push(text[number][1]);
  } else {
    arrayButtons.push(text[number][0]);
  }

  let lengthAnswers = response.length - 2;
  let responseAnswers = response;
  let preFinalText = text[number];
  let finalText = preFinalText.map(word => word.toLowerCase());

  //generation of 3 wrong answers
  for (let i = 1; i < 3; i++) {
    responseAnswers = subtractArrays(responseAnswers, finalText); //list of possible wrong answers, created by substracting already taken options from the whole list
    finalText = numberGen(lengthAnswers, responseAnswers);
    if (reg) {
      arrayButtons.push(finalText[1]);
    } else {
      arrayButtons.push(finalText[0]);
    }

    lengthAnswers = lengthAnswers - 1;
  }
  let arrayButtonsFinal = shuffleArray(arrayButtons);
  return [arrayButtonsFinal, number, text];
};

const allWordsCallArray = async (mode, type) => {
  let response;
  let wordArray;

  if (type == "words") {
    response = await call("words");
  }
  if (type == "phrases") {
    response = await call("phrases");
  }
  if (type == "english") {
    response = await call("english");
  }
  try {
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
    ctx.replyWithHTML(text.join("").toString());
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

  //function for typing checking
  // const wordBotInteractionTyping = async (ctx, ctx, type = "words") => {

  // }
  let i_count = 0;
  //main function for the words learning mode
  const wordBotInteraction = async (
    ctx,
    type = "words",
    modeType = "direct"
  ) => {

    if (ctx.callbackQuery === undefined && ctx.message.text === undefined) {
      ctx.reply(`You should select an option`);
      return;
    }
    if (ctx.message !== undefined) {
      if (ctx.message.text.toLowerCase() == ctx.wizard.state.data) {
        ctx.reply("Correct!");
        i_count = 0;
      } else {
        if (i_count >= 2) {
          ctx.reply(
            `The correct answer is: ${ctx.wizard.state.data}. No worries! Now type the correct word`
          );
        } else {
          ctx.reply("Incorrect! Try one more time");
        }

        i_count = i_count + 1;
        return;
      }
    }
    if (ctx.callbackQuery !== undefined) {
      if (ctx.callbackQuery.data === "exit") {
        ctx.reply(`You left the learning mode`);
        return ctx.scene.leave();
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
    }

    let newArray = ctx.wizard.state.array;
    let responseFinal;
    if (modeType == "direct") {
      try {
        responseFinal = await messageCompose(newArray, true, type);
      } catch (err) {
        console.log(err);
      }
    }
    if (modeType == "reversed") {
      try {
        responseFinal = await messageCompose(newArray, (reg = false), type);
      } catch (err) {
        console.log(err);
      }
    }

    if (modeType == "typing") {
      try {
        responseFinal = await messageComposeType(newArray, (reg = false), type);
      } catch (err) {
        console.log(err);
      }
    }
    let number = responseFinal[1];
    if (modeType == "typing") {
      number = responseFinal[0];
    }
    if (modeType == "direct") {
      ctx.wizard.state.data = text[number][1];
      ctx.wizard.state.array = newArray.concat([
        text[number][0],
        text[number][1],
      ]);
      ctx.replyWithHTML(
        `What does <b>${text[number][0]}</b> mean?`,
        yesNoKeyboard(responseFinal[0])
      );
    }
    if (modeType == "reversed") {
      ctx.wizard.state.data = text[number][0];
      ctx.wizard.state.array = newArray.concat([
        text[number][0],
        text[number][1],
      ]);
      ctx.replyWithHTML(
        `What does <b>${text[number][1]}</b> mean?`,
        yesNoKeyboard(responseFinal[0])
      );
    }
    if (modeType == "typing") {
      ctx.wizard.state.data = text[number][0];
      ctx.wizard.state.array = newArray.concat([
        text[number][0],
        text[number][1],
      ]);
      ctx.replyWithHTML(
        `What does <b>${text[number][1]}</b> mean? Please type`
      );
    }

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
        await wordBotInteraction(ctx, (type = "words"), (modeType = "typing"));
      } catch (err) {
        console.log(err);
      }
    },
    async (ctx) => {
      try {
        await wordBotInteraction(
          ctx,
          (type = "words"),
          (modeType = "reversed")
        );
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
        await wordBotInteraction(
          ctx,
          (type = "words"),
          (modeType = "reversed")
        );
      } catch (err) {
        console.log(err);
      }
    },
    async (ctx) => {
      try {
        await wordBotInteraction(ctx, (type = "words"), (modeType = "typing"));
      } catch (err) {
        console.log(err);
      }
    },
    async (ctx) => {
      try {
        await wordBotInteraction(
          ctx,
          (type = "words"),
          (modeType = "reversed")
        );
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
        await wordBotInteraction(
          ctx,
          (type = "words"),
          (modeType = "reversed")
        );
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
        await wordBotInteraction(
          ctx,
          (type = "words"),
          (modeType = "reversed")
        );
      } catch (err) {
        console.log(err);
      }
    },

    async (ctx) => {
      try {
        await wordBotInteraction(ctx, (type = "words"), (modeType = "typing"));
      } catch (err) {
        console.log(err);
      }
    },

    async (ctx) => {
      try {
        await wordBotInteraction(
          ctx,
          (type = "words"),
          (modeType = "reversed")
        );
      } catch (err) {
        console.log(err);
      }
    },

    async (ctx) => {
      if (ctx.callbackQuery.data == ctx.wizard.state.data) {
        ctx.reply("Correct! Good Job! The session is complete");
      } else {
        ctx.reply("Incorrect! Try one more time");
        return;
      }
      return ctx.scene.leave();
    }
  );

  const wordsPhrasesWizard = new Scenes.WizardScene(
    "phrases",
    async (ctx) => {
      let responseFinal;
      try {
        responseFinal = await messageCompose([], true, "phrases");
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
        await wordBotInteraction(ctx, ([], true, "phrases"));
      } catch (err) {
        console.log(err);
      }
    },
    async (ctx) => {
      try {
        await wordBotInteraction(
          ctx,
          (type = "phrases"),
          (modeType = "reversed")
        );
      } catch (err) {
        console.log(err);
      }
    },
    async (ctx) => {
      try {
        await wordBotInteraction(ctx, ([], true, "phrases"));
      } catch (err) {
        console.log(err);
      }
    },
    async (ctx) => {
      try {
        await wordBotInteraction(
          ctx,
          (type = "phrases"),
          (modeType = "reversed")
        );
      } catch (err) {
        console.log(err);
      }
    },
    async (ctx) => {
      try {
        await wordBotInteraction(ctx, (type = "phrases"));
      } catch (err) {
        console.log(err);
      }
    },
    async (ctx) => {
      try {
        await wordBotInteraction(
          ctx,
          (type = "phrases"),
          (modeType = "reversed")
        );
      } catch (err) {
        console.log(err);
      }
    },
    async (ctx) => {
      try {
        await wordBotInteraction(ctx, (type = "phrases"));
      } catch (err) {
        console.log(err);
      }
    },
    async (ctx) => {
      try {
        await wordBotInteraction(
          ctx,
          (type = "phrases"),
          (modeType = "reversed")
        );
      } catch (err) {
        console.log(err);
      }
    },
    async (ctx) => {
      try {
        await wordBotInteraction(ctx, (type = "phrases"));
      } catch (err) {
        console.log(err);
      }
    },
    async (ctx) => {
      try {
        await wordBotInteraction(
          ctx,
          (type = "phrases"),
          (modeType = "reversed")
        );
      } catch (err) {
        console.log(err);
      }
    },

    async (ctx) => {
      try {
        await wordBotInteraction(
          ctx,
          (type = "phrases"),
          (modeType = "reversed")
        );
      } catch (err) {
        console.log(err);
      }
    },

    async (ctx) => {
      try {
        await wordBotInteraction(
          ctx,
          (type = "phrases"),
          (modeType = "reversed")
        );
      } catch (err) {
        console.log(err);
      }
    },

    async (ctx) => {
      if (ctx.callbackQuery.data == ctx.wizard.state.data) {
        ctx.reply("Correct! Good Job! The session is complete");
      } else {
        ctx.reply("Incorrect! Try one more time");
        return;
      }
      return ctx.scene.leave();
    }
  );

  const engMode = new Scenes.WizardScene(
    "english",
    async (ctx) => {
      ctx.replyWithHTML(
        "Please wait until the session starts. It could take up to 30 seconds"
      );
      let responseFinal;
      try {
        responseFinal = await messageCompose([], true, "english");
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
        await wordBotInteraction(ctx, ([], true, "english"));
      } catch (err) {
        console.log(err);
      }
    },
    async (ctx) => {
      try {
        await wordBotInteraction(ctx, ([], true, "english"));
      } catch (err) {
        console.log(err);
      }
    },
    async (ctx) => {
      try {
        await wordBotInteraction(
          ctx,
          (type = "english"),
          (modeType = "reversed")
        );
      } catch (err) {
        console.log(err);
      }
    },
    async (ctx) => {
      try {
        await wordBotInteraction(ctx, (type = "english"));
      } catch (err) {
        console.log(err);
      }
    },
    async (ctx) => {
      try {
        await wordBotInteraction(
          ctx,
          (type = "english"),
          (modeType = "reversed")
        );
      } catch (err) {
        console.log(err);
      }
    },
    async (ctx) => {
      try {
        await wordBotInteraction(ctx, (type = "english"));
      } catch (err) {
        console.log(err);
      }
    },
    async (ctx) => {
      try {
        await wordBotInteraction(
          ctx,
          (type = "english"),
          (modeType = "reversed")
        );
      } catch (err) {
        console.log(err);
      }
    },
    async (ctx) => {
      try {
        await wordBotInteraction(ctx, (type = "english"));
      } catch (err) {
        console.log(err);
      }
    },
    async (ctx) => {
      try {
        await wordBotInteraction(
          ctx,
          (type = "english"),
          (modeType = "reversed")
        );
      } catch (err) {
        console.log(err);
      }
    },
    async (ctx) => {
      try {
        await wordBotInteraction(
          ctx,
          (type = "english"),
          (modeType = "reversed")
        );
      } catch (err) {
        console.log(err);
      }
    },
    async (ctx) => {
      try {
        await wordBotInteraction(
          ctx,
          (type = "english"),
          (modeType = "reversed")
        );
      } catch (err) {
        console.log(err);
      }
    },
    async (ctx) => {
      if (ctx.callbackQuery.data == ctx.wizard.state.data) {
        ctx.reply("Correct! Good Job! The session is complete");
      } else {
        ctx.reply("Incorrect! Try one more time");
        return;
      }
      return ctx.scene.leave();
    }
  );

  const stage = new Scenes.Stage([
    wordsDataWizard,
    wordsPhrasesWizard,
    engMode,
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

  bot.launch();
};

exports.wordBot = wordBot;
