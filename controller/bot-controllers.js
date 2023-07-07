const { Telegraf } = require("telegraf");
const { call } = require("../google-engine/google-api");

const bot = new Telegraf(process.env.TOKEN);

const wordBot = () => {
  bot.start(async (ctx) => {
    ctx.replyWithHTML(
      `Привет, ${ctx.from.first_name}! Давай изучать слова!`
    );
  });

bot.command("allwords", async (ctx) => {
    const text = []
    const response = await call()
    const wordArray = response.values
    for (i in wordArray) {
        if (i != 0){
            let value = ''
            value = wordArray[i][0] + ': ' + wordArray[i][1] + ' \n'
            // ctx.replyWithHTML(value)
            text.push(value)
            
        }
        
    }

    console.log(text.join("").toString())
    ctx.replyWithHTML(text.join("").toString())
})

  bot.launch();
};

exports.wordBot = wordBot;
