const qrcode = require("qrcode-terminal");
const { Client, LocalAuth, MessageMedia } = require("whatsapp-web.js");
const {
  getJoke,
  sendImageMessage,
  sendStickerFromImage,
  sendVoiceNote,
  downloadAudio,
} = require("./function");

const whatsapp = new Client({
  authStrategy: new LocalAuth(),
});

whatsapp.on("qr", (qr) => {
  qrcode.generate(qr, { small: true });
  console.log("QR Code is ready, scan it with your phone.");
});

whatsapp.on("ready", () => {
  console.log("Client is ready!");
});

whatsapp.on("message", async (message) => {
  try {
    console.log(message.body);
    const urlMatch = message.body.match(/\/voice\s(https?:\/\/\S+)/);

    if (message.body === "/help") {
      await whatsapp.sendMessage(
        message.from,
        "/help : help \n/joke : send a joke \n/meme : send meme img\n/sticker"
      );
    } else if (message.body === "/balance") {
      await whatsapp.sendMessage(message.from, "Your balance is : $500");
    } else if (message.body === "/joke") {
      const pesan = await getJoke();
      console.log(message.from);
      await whatsapp.sendMessage(message.from, pesan);
    } else if (message.body == "/randomPicker") {
      await handleRandomPickerCommand(whatsapp, message);
    } else if (message.body == "/meme") {
      await sendImageMessage(whatsapp, message);
    } else if (message.body == "/sticker") {
      await sendStickerFromImage(whatsapp, message);
    } else if (urlMatch) {
      const youtubeUrl = urlMatch[1];
      const audioBuffer = await downloadAudio(youtubeUrl);
      await sendVoiceNote(whatsapp, message, audioBuffer);
    } else if (message.body == "/send") {
      const media = MessageMedia.fromFilePath("audio.mp3");
      await whatsapp.sendMessage(message.from, media, { sendAudioAsVoice: true });
    }
  } catch (error) {
    console.error("An error occurred:", error.message);
    await whatsapp.sendMessage(message.from, "An error occurred. Please try again later.");
  }
});

whatsapp.initialize();
