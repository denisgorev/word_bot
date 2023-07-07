const call = async () => {
    const credentials = JSON.parse(process.env.keys);
    console.log(credentials)
  const { google } = require("googleapis");
  const SCOPES = ["https://www.googleapis.com/auth/spreadsheets"];
  const auth = new google.auth.GoogleAuth({
    
    credentials: credentials,
    scopes: SCOPES,
  });
  const authClientObject = await auth.getClient();
  const googleSheetsInstance = google.sheets({
    version: "v4",
    auth: authClientObject,
  });
  const spreadsheetId = "1I275HAkbd8W9bPwwl9kV0pnscdQ_0b38aMoncSjEYuY";

  const readData = await googleSheetsInstance.spreadsheets.values.get({
    auth, //auth object
    spreadsheetId, // spreadsheet id
    range: "Words!A:B", //range of cells to read from.
  });

  // console.log(readData.data);
  return readData.data;
};

module.exports = {
  call,
};
