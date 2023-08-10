const credentials = JSON.parse(process.env.keys);
const { google } = require("googleapis");
const SCOPES = ["https://www.googleapis.com/auth/spreadsheets"];
const auth = new google.auth.GoogleAuth({
  credentials: credentials,
  scopes: SCOPES,
});
const call = async (type = "words") => {
  try {
    const authClientObject = await auth.getClient();
    const googleSheetsInstance = google.sheets({
      version: "v4",
      auth: authClientObject,
    });
    let readData;
    const spreadsheetId = "1I275HAkbd8W9bPwwl9kV0pnscdQ_0b38aMoncSjEYuY";

    if (type == "words") {
      readData = await googleSheetsInstance.spreadsheets.values.get({
        auth, //auth object
        spreadsheetId, // spreadsheet id
        range: "Words!A:B", //range of cells to read from.
      });
    }
    if (type == "phrases") {
      readData = await googleSheetsInstance.spreadsheets.values.get({
        auth, //auth object
        spreadsheetId, // spreadsheet id
        range: "Phrases!A:B", //range of cells to read from.
      });
    }

    if (type == "english") {
      readData = await googleSheetsInstance.spreadsheets.values.get({
        auth, //auth object
        spreadsheetId, // spreadsheet id
        range: "English!A:D", //range of cells to read from.
      });
    }

    return readData.data;
  } catch (err) {
    console.log(err);
  }
};

const updateGoogle = async (newValue, index) => {

  if (index === undefined) {
    return
  }

  
  index = parseInt(index) + 1
  // console.log("google api", index)
  try {
    const authClientObject = await auth.getClient();
    const googleSheetsInstance = google.sheets({
      version: "v4",
      auth: authClientObject,
    });

    await googleSheetsInstance.spreadsheets.values.update({
      spreadsheetId: "1I275HAkbd8W9bPwwl9kV0pnscdQ_0b38aMoncSjEYuY",
      valueInputOption: "USER_ENTERED",
      range: `English!C${index}`,
      resource: {
        values: [[newValue]],
      },
    });
  } catch (err) {
    console.log(err);
  }
};

module.exports = {
  call,
  updateGoogle,
};
