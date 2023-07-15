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
  let finalText = text[number];

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

//main function for the words learning mode for vice versa
const wordBotInteractionVV = async (ctx, type = "words") => {
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
    responseFinal = await messageCompose(newArray, false, type);
  } catch (err) {
    console.log(err);
  }
  let number = responseFinal[1];
  ctx.wizard.state.data = text[number][0];
  ctx.wizard.state.array = newArray.concat([text[number][0], text[number][1]]);
  ctx.replyWithHTML(
    `What does <b>${text[number][1]}</b> mean in Dutch?`,
    yesNoKeyboard(responseFinal[0])
  );
  return ctx.wizard.next();
};

//main function for the words learning mode
const wordBotInteraction = async (ctx, type = "words") => {
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
    responseFinal = await messageCompose(newArray, true, type);
  } catch (err) {
    console.log(err);
  }

  let number = responseFinal[1];
  ctx.wizard.state.data = text[number][1];
  ctx.wizard.state.array = newArray.concat([text[number][0], text[number][1]]);
  ctx.replyWithHTML(
    `What does <b>${text[number][0]}</b> mean?`,
    yesNoKeyboard(responseFinal[0])
  );
  return ctx.wizard.next();
};

const sessionGenerator = async (ctx) => {
  async (ctx) => {
    console.log(ctx)
    ctx.replyWithHTML(
      "Please wait until the session starts. It could take up to 30 seconds"
    );
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
        await wordBotInteractionVV(ctx);
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
        await wordBotInteractionVV(ctx);
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
        await wordBotInteractionVV(ctx);
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
        await wordBotInteractionVV(ctx);
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
        await wordBotInteractionVV(ctx);
      } catch (err) {
        console.log(err);
      }
    },
    async (ctx) => {
      try {
        await wordBotInteractionVV(ctx);
      } catch (err) {
        console.log(err);
      }
    },
    async (ctx) => {
      try {
        await wordBotInteractionVV(ctx);
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
    };
};

exports.sessionGenerator = sessionGenerator;
