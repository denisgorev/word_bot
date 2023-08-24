const { messageCompose, wordBotInteraction } = require("../utils/general-functions");
const { Scenes } = require("telegraf");
const { yesNoKeyboard } = require("../../utils/keyboards");

const wordsDataWizard = new Scenes.WizardScene(
    "words",
    async (ctx) => {
      let responseFinal;
      try {
        responseFinal = await messageCompose(ctx);
      } catch (err) {
        console.log(err);
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

  module.exports = wordsDataWizard;
