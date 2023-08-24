const {
  messageCompose,
  wordBotInteraction,
} = require("../utils/general-functions");
const { Scenes } = require("telegraf");
const { yesNoKeyboard } = require("../../utils/keyboards");

const engMode = new Scenes.WizardScene(
  "english",
  async (ctx) => {
    let responseFinal;
    try {
      responseFinal = await messageCompose(ctx, [], true, "english");
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
      await wordBotInteraction(ctx, (type = "english"), (modeType = "typing"));
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
      await wordBotInteraction(ctx, (type = "english"), (modeType = "typing"));
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
      await wordBotInteraction(ctx, (type = "english"), (modeType = "typing"));
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
      await wordBotInteraction(ctx, (type = "english"), (modeType = "typing"));
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
      await wordBotInteraction(ctx, (type = "english"), (modeType = "typing"));
    } catch (err) {
      console.log(err);
    }
  },

  async (ctx) => {
    try {
      await wordBotInteraction(ctx, (type = "english"), (modeType = "typing"));
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
      await wordBotInteraction(ctx, (type = "english"), (modeType = "typing"));
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
      await wordBotInteraction(ctx, (type = "english"), (modeType = "typing"));
    } catch (err) {
      console.log(err);
    }
  },

  async (ctx) => {
    try {
      await wordBotInteraction(ctx, (type = "english"), (modeType = "typing"));
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
      await wordBotInteraction(ctx, (type = "english"), (modeType = "typing"));
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

module.exports = engMode;
