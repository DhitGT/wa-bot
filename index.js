const qrcode = require("qrcode-terminal");
const fetch = require("node-fetch"); // Make sure to require the 'node-fetch' library
const { Client, LocalAuth, MessageMedia } = require("whatsapp-web.js");
const regex = /^\/spam @(\d+)\s(.+)/;

const whatsapp = new Client({
  authStrategy: new LocalAuth(),
});

whatsapp.on("qr", (qr) => {
  qrcode.generate(qr, { small: true });
});

whatsapp.on("ready", () => {
  console.log("Client is ready!");
});

whatsapp.on("message", async (message) => {
  console.log(message.body);
  if (message.body === "/help") {
    whatsapp.sendMessage(
      message.from,
      "/h : help \n/balance : to check balance"
    );
  } else if (message.body === "/balance") {
    whatsapp.sendMessage(message.from, "Your balance is : $500");
  } else if (message.body === "/joke") {
    const pesan = await getJoke();
    console.log(message.from);
    whatsapp.sendMessage(message.from, pesan);
  } else if (message.body == "/randomPicker") {
    await handleRandomPickerCommand(whatsapp, message);
  } else if (message.body == "/placehold") {
    const media = await MessageMedia.fromUrl(
      "https://via.placeholder.com/350x150.png"
    );
    whatsapp.sendMessage(media);
  }
});

const getJoke = async () => {
  const response = await fetch(
    "https://candaan-api.vercel.app/api/text/random"
  );
  const data = await response.json();
  const joke = String(data.data);
  return joke;
};

whatsapp.initialize();
