var path = require("path");

const STT = async (ctx, text, language = "en") => {

    console.log(text)
  var gtts = require("node-gtts")(language);

  if (ctx.message !== undefined) {
    gtts.save("audio.wav", text, (err) => {
      if (err) {
        console.error(err);
      }
      ctx.replyWithVoice({
        source: "./audio.wav",
      });
    });
  } else if (ctx.callbackQuery !== undefined) {
    gtts.save("audio.wav", text, (err) => {
      if (err) {
        console.error(err);
      }
      ctx.replyWithVoice({
        source: "./audio.wav",
      });
    });
  }

};

exports.STT = STT;
