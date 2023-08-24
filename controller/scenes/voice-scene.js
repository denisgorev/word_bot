const { Scenes } = require("telegraf");
var gtts = require("node-gtts")("en");
const fs = require("fs");


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

module.exports = voiceMode;