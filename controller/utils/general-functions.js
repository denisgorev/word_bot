const { call } = require("../../google-engine/google-api");
const { yesNoKeyboard } = require("../../utils/keyboards");
const { chatGPT } = require("./chat-gpt");
const { getRandomWord } = require("./relevance-id");
const { STT } = require("./speech-to-text");

const wordBotInteraction = async (ctx, type = "words", modeType = "direct") => {
  let i_count = 0;
  if (ctx.callbackQuery === undefined && ctx.message.text === undefined) {
    ctx.reply(`You should select an option`);
    return;
  }

  if (ctx.message !== undefined) {
    if (
      ctx.wizard.state == undefined ||
      ctx.message.text === "exit" ||
      ctx.message.text === "Exit"
    ) {
      ctx.reply(`You left the learning mode`);
      return ctx.scene.leave();
    }

    if (ctx.wizard.state.gpt == true) {
      console.log(true, ctx.message.text);
      const userInput = ctx.message.text;
      console.log(userInput);
      const chatGPTResponse = await chatGPT(userInput);
      await ctx.replyWithHTML(chatGPTResponse);
      
    }

    if (
      ctx.message.text.trim().toLowerCase() ==
      ctx.wizard.state.data.trim().toLowerCase() || ctx.wizard.state.gpt == true
    ) {
      if (type == "english") {
        await STT(ctx, ctx.wizard.state.correct);
      } else {
        await STT(ctx, ctx.wizard.state.correct, "nl");
      }
      if (ctx.wizard.state.gpt == true) {
        await ctx.reply(ctx.wizard.state.data);
        await ctx.reply(ctx.wizard.state.translate);  
        
      } else {
        await ctx.reply("Correct!");
      }
      

      i_count = 0;
    } else if (ctx.message.text == "idk" || ctx.message.text == "Idk") {
      if (type == "english") {
        await STT(ctx, ctx.wizard.state.correct);
      } else {
        await STT(ctx, ctx.wizard.state.correct, "nl");
      }
      await ctx.reply(
        `The correct answer is: ${ctx.wizard.state.data}. Now type or select the correct word`
      );
      i_count = 0;
      return;
    } else {
      if (i_count >= 2) {
        if (type == "english") {
          await STT(ctx, ctx.wizard.state.correct);
        } else {
          await STT(ctx, ctx.wizard.state.correct, "nl");
        }
        await ctx.reply(
          `The correct answer is: ${ctx.wizard.state.data}. No worries! Now type the correct word`
        );
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
      if (type == "english") {
        await STT(ctx, ctx.wizard.state.correct);
      } else {
        await STT(ctx, ctx.wizard.state.correct, "nl");
      }
      await ctx.reply("Correct!");
    } else {
      ctx.reply("Incorrect! Try one more time");
      return;
    }
  }

  let newArray = ctx.wizard.state.array;
  let responseFinal;
  if (modeType == "direct") {
    try {
      responseFinal = await messageCompose(ctx, newArray, true, type);
    } catch (err) {
      console.log(err);
    }
  }
  if (modeType == "reversed") {
    try {
      responseFinal = await messageCompose(ctx, newArray, (reg = false), type);
    } catch (err) {
      console.log(err);
    }
  }

  if (modeType == "typing") {
    try {
      responseFinal = await messageComposeType(
        ctx,
        newArray,
        (reg = false),
        type
      );
    } catch (err) {
      console.log(err);
    }
  }

  if (modeType == "gpt_phrases") {
    console.log("gpt_phrases first");
    try {
      responseFinal = await messageComposeGPT(
        ctx,
        newArray,
        (reg = false),
        type
      );
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

  if (modeType == "typing" || modeType == "gpt_phrases") {
    number = responseFinal[0];
  }
  if (modeType == "direct") {
    if (text[number] == undefined) {
      ctx.reply(`There are no more questions. You left the learning mode`);
      return ctx.scene.leave();
    }
    console.log(text[number]);
    ctx.wizard.state.data = text[number][1];
    ctx.wizard.state.correct = text[number][0];
    ctx.wizard.state.gpt = false;
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
    console.log(text[number]);
    ctx.wizard.state.data = text[number][0];
    ctx.wizard.state.correct = text[number][0];
    ctx.wizard.state.gpt = false;
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

    ctx.wizard.state.gpt = false;
    ctx.wizard.state.array = newArray.concat([
      text[number][0],
      text[number][1],
    ]);
    ctx.replyWithHTML(`What does <b>${text[number][1]}</b> mean? Please type`);
  }

  if (modeType == "gpt_phrases") {

    console.log(text[number]);
    console.log(number);

    if (text[number] == undefined) {
      ctx.reply(`There are no more questions. You left the learning mode`);
      return ctx.scene.leave();
    }


    ctx.replyWithHTML(
      `Chat GPT mode! Please compose a sentence with the following word: <b>${text[number][0]}</b>. Chat GPT will check it, but it could take some time`
    );
    ctx.wizard.state.data = text[number][0];
    ctx.wizard.state.translate = text[number][1];
    ctx.wizard.state.correct = text[number][0];
    ctx.wizard.state.gpt = true;
    ctx.wizard.state.array = newArray.concat([
      text[number][0],
      text[number][1],
    ]);
  }

  return ctx.wizard.next();
};

const messageCompose = async (ctx, minus = [], reg = true, type = "words") => {
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
    const randomWord = getRandomWord(text);
    number = randomWord.index;
  } else if (type == "words") {
    // "306807986" "Nastya"
    //275498236 Denis
    if (ctx.from.id == "275498236") {
      text = text.map(([first, second, , fourth, fifth]) => [
        first,
        second,
        fourth,
        fifth,
      ]);

      const randomWord = getRandomWord(text, "nl", "D");
      number = randomWord.index;
    }
    if (ctx.from.id == "306807986") {
      text = text.map(([first, second, third, , fifth]) => [
        first,
        second,
        third,
        fifth,
      ]);

      const randomWord = getRandomWord(text, "nl", "C");
      number = randomWord.index;
    }
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
  //   let correctWord = finalText

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

const messageComposeGPT = async (
  ctx,
  minus = [],
  reg = true,
  type = "words"
) => {
  try {
    console.log("chat gpt second");
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
    console.log("chat gpt third");
    console.log(number);
  } else {
    return;
  }
  return [number, text];
};

const messageComposeType = async (
  ctx,
  minus = [],
  reg = true,
  type = "words"
) => {
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
  } else if (type == "words") {
    // "306807986" "Nastya"
    //275498236 Denis
    if (ctx.from.id == "275498236") {
      text = text.map(([first, second, , fourth, fifth]) => [
        first,
        second,
        fourth,
        fifth,
      ]);

      const randomWord = getRandomWord(text, "nl", "D");
      number = randomWord.index;
    }
    if (ctx.from.id == "306807986") {
      text = text.map(([first, second, third, , fifth]) => [
        first,
        second,
        third,
        fifth,
      ]);

      const randomWord = getRandomWord(text, "nl", "C");
      number = randomWord.index;
    }
  } else {
    let length = text.length - 1;
    number = getRandomInt(1, length);
  }

  return [number, text];
};

const allWordsCallArray = async (mode, type) => {
  let text = "";
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

const byteSize = (str) => {
  return Buffer.byteLength(str, "utf8");
};

function subtractArrays(array1, array2) {
  const set2 = new Set(array2);
  const result = array1.filter(([word]) => !set2.has(word));
  return result;
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

function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

module.exports = {
  messageCompose,
  messageComposeType,
  wordBotInteraction,
  allWordsCallArray,
};
