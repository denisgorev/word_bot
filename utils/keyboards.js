const { Telegraf, Markup } = require("telegraf");

// const yesNoKeyboard = (buttons) => {
//     return Markup.inlineKeyboard([
//         buttons.map(button => Markup.button.callback(button, button)),
//     ])
// }

const yesNoKeyboard = (buttons) => {
    const keyboardRows = buttons.map((button) => [Markup.button.callback(button, button)]);
    keyboardRows.push([Markup.button.callback('----exit----', 'exit')]); // Add 'exit' button as a new row
    return Markup.inlineKeyboard(keyboardRows);
  };

exports.yesNoKeyboard = yesNoKeyboard;