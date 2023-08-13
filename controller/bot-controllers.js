const { Telegraf } = require("telegraf");
const { call } = require("../google-engine/google-api");
const { yesNoKeyboard } = require("../utils/keyboards");
const { Scenes, Stage, session } = require("telegraf");
const { getRandomWord } = require("./controller-functions");
const { STT } = require("./speech-to-text");
var gtts = require("node-gtts")("en");

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
  let response;

  try {
    response = await allWordsCallArray("array", type);
    text = subtractArrays(response, minus);
  } catch (err) {
    console.log(err);
    process.exit(1);
  }

  if (type === "english") {
    // Print the resulting wordList
    const randomWord = getRandomWord(text);
    number = randomWord.index;
  } else {
    let length = text.length - 1;
    number = getRandomInt(1, length);
  }

  return [number, text];
};

const byteSize = (str) => {
  return Buffer.byteLength(str, "utf8");
};

const messageCompose = async (minus = [], reg = true, type = "words") => {
  let response;
  let number;
  const arrayButtons = [];

  try {
    response = await allWordsCallArray("array", type);
    text = subtractArrays(response, minus);
  } catch (err) {
    console.log(err);
    process.exit(1);
  }

  if (type == "english") {
    // const header = text.shift();

    // Print the resulting wordList
    const randomWord = getRandomWord(text);
    number = randomWord.index;
  } else {
    let length = text.length - 1;
    number = getRandomInt(1, length);
  }

  let attemps = 0;

  //to check if the size of the text is less than 65 (otherwise the button generation will fail)
  while (byteSize(text[number][1]) > 65) {
    if (attemps > 4) {
      break;
    }
    number = getRandomInt(1, length);
    // let check = byteSize(text[number][1]); //to delete
    // console.log("while loop first check", text[number][1], check, attemps); //to delete
    attemps++;
  }

  if (byteSize(text[number][1]) > 65) {
    return;
  }

  if (text[number] == undefined) {
    return;
  }
  if (reg) {
    arrayButtons.push(text[number][1]);
  } else {
    arrayButtons.push(text[number][0]);
  }

  let lengthAnswers = response.length - 2;
  let responseAnswers = response;
  let preFinalText = text[number];

  let finalText = preFinalText.map((word) => word.toLowerCase().trim());

  //generation of 4 wrong answers
  for (let i = 1; i < 4; i++) {
    responseAnswers = subtractArrays(responseAnswers, finalText); //list of possible wrong answers, created by substracting already taken options from the whole list
    finalText = numberGen(lengthAnswers, responseAnswers);
    attemps = 0;
    while (byteSize(finalText[1]) > 65 || attemps > 4) {
      finalText = numberGen(lengthAnswers, responseAnswers);
    }

    if (byteSize(finalText[1]) > 65) {
      return;
    }

    if (finalText == undefined) {
      return;
    }
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
      if (ctx.wizard.state == undefined || ctx.message.text === "exit") {
        ctx.reply(`You left the learning mode`);
        return ctx.scene.leave();
      }

      if (ctx.message.text.toLowerCase() == ctx.wizard.state.data) {
        ctx.reply("Correct!");
        if (type == "english") {
          STT(ctx, ctx.wizard.state.correct);
        }
        i_count = 0;
      } else if (ctx.message.text == "idk" || ctx.message.text == "Idk") {
        ctx.reply(`The correct answer is: ${ctx.wizard.state.data}`);
        if (type == "english") {
          STT(ctx, ctx.wizard.state.correct);
        }
        i_count = 0;
      } else {
        if (i_count >= 2) {
          ctx.reply(
            `The correct answer is: ${ctx.wizard.state.data}. No worries! Now type the correct word`
          );
          if (type == "english") {
            STT(ctx, ctx.wizard.state.correct);
          }
        } else {
          ctx.reply("Incorrect! Try one more time or type 'idk' ");
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
        console.log(ctx);
        if (type == "english") {
          console.log(
            "check callbackQuery",
            ctx.callbackQuery.data,
            ctx.wizard.state.correct
          );
          STT(ctx, ctx.wizard.state.correct);
        }
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

    if (responseFinal == undefined) {
      ctx.reply(
        `Very good! There are no more words in the list, so you left the learning mode`
      );
      return ctx.scene.leave();
    }

    let number = responseFinal[1];

    if (modeType == "typing") {
      number = responseFinal[0];
    }
    if (modeType == "direct") {
      if (text[number] == undefined) {
        ctx.reply(`There are no more questions. You left the learning mode`);
        return ctx.scene.leave();
      }
      ctx.wizard.state.data = text[number][1];
      ctx.wizard.state.correct = text[number][0];
      console.log(ctx.wizard.state.correct);
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
      if (text[number] == undefined) {
        ctx.reply(`There are no more questions. You left the learning mode`);
        return ctx.scene.leave();
      }
      ctx.wizard.state.data = text[number][0];
      ctx.wizard.state.correct = text[number][0];
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
      if (text[number] == undefined) {
        ctx.reply(`There are no more questions. You left the learning mode`);
        return ctx.scene.leave();
      }
      ctx.wizard.state.data = text[number][0];
      ctx.wizard.state.correct = text[number][0];
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
        await wordBotInteraction(ctx, (type = "words"), (modeType = "typing"));
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
        await wordBotInteraction(ctx, (type = "words"), (modeType = "typing"));
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
        ctx.reply(
          "Correct! Good Job! The session is complete. I will fall asleep soon, to wake me up please click on https://word-bot.onrender.com"
        );
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
        ctx.reply(
          "Correct! Good Job! The session is complete. I will fall asleep soon, to wake me up please click on https://word-bot.onrender.com"
        );
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
      let responseFinal;
      try {
        responseFinal = await messageCompose([], true, "english");
      } catch (err) {
        console.log(err);
      }
      if (responseFinal == undefined) {
        ctx.replyWithHTML("Something went wrong, the session is over");
        return ctx.scene.leave();
      }
      let number = responseFinal[1];
      ctx.wizard.state.data = text[number][1];
      ctx.wizard.state.correct = text[number][0];
      ctx.wizard.state.array = [text[number][0], text[number][1]];
      ctx.replyWithHTML(
        `What does <b>${text[number][0]}</b> mean?`,
        yesNoKeyboard(responseFinal[0])
      );
      return ctx.wizard.next();
    },

    async (ctx) => {
      try {
        await wordBotInteraction(
          ctx,
          (type = "english"),
          (modeType = "typing")
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
          (modeType = "typing")
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
          (modeType = "typing")
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
          (modeType = "typing")
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
          (modeType = "typing")
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
          (modeType = "typing")
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
          (modeType = "typing")
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
          (modeType = "typing")
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
          (modeType = "typing")
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
          (modeType = "typing")
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
      if (ctx.callbackQuery == undefined) {
        ctx.reply(
          "Correct! Good Job! The session is complete. I will fall asleep soon, to wake me up please click on https://word-bot.onrender.com"
        );
        return ctx.scene.leave();
      }

      if (ctx.callbackQuery.data == ctx.wizard.state.data) {
        ctx.reply(
          "Correct! Good Job! The session is complete. I will fall asleep soon, to wake me up please click on https://word-bot.onrender.com"
        );
      } else {
        ctx.reply("Incorrect! Try one more time");
        return;
      }
      return ctx.scene.leave();
    }
  );

  const voiceMode = new Scenes.WizardScene(
    "voice",
    (ctx) => {
      ctx.reply(`write an english word`);
      ctx.wizard.state.data = {};
      return ctx.wizard.next();
    },

    async (ctx) => {
      gtts.save("audio.wav", ctx.message.text, (err) => {
        if (err) {
          console.error(err);
        }
        ctx.replyWithVoice({
          source: "./audio.wav",
        });
      });
      // say.export("What's up, dog?", 'Good News', 1.0, 'hal.wav', (err) => {
      //   if (err) {
      //     console.error(err);
      //   }

      // });
      return ctx.scene.leave();
    }
  );

  const stage = new Scenes.Stage([
    wordsDataWizard,
    wordsPhrasesWizard,
    engMode,
    voiceMode,
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

  bot.launch();
};

exports.wordBot = wordBot;
