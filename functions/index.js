const functions = require("firebase-functions");
const line = require("@line/bot-sdk");
const admin = require("firebase-admin");

admin.initializeApp({
  credential: admin.credential.cert({
    projectId: functions.config().linebot.project_id,
    privateKey: functions.config().linebot.private_key.replace(/\\n/g, "\n"),
    clientEmail: functions.config().linebot.client_email,
  }),
});
const db = admin.firestore();

const config = {
  channelAccessToken: functions.config().linebot.access_token,
  channelSecret: functions.config().linebot.secret,
};
const client = new line.Client(config);

/**
 * Hello World関数
 */
exports.helloWorld = functions.https.onRequest(async (req, res) => {
  const events = req.body.events[0];
  const messages = [
    {
      type: "text",
      text: events.message.text,
    },
    {
      type: "text",
      text: "オウム返しするだけのBOTだと思ったか？？",
    },
  ];
  // Hello Wolrdを送信する。
  await client.replyMessage(events.replyToken, messages);

  const messageCol = db.collection("messages");
  await messageCol.add({
    created_at: admin.firestore.FieldValue.serverTimestamp(),
    update_at: admin.firestore.FieldValue.serverTimestamp(),
    message: events.message.text,
  });
  res.status(200).send();
});
