const qrcode = require("qrcode-terminal");
const axios = require("axios");
const fs = require("fs");
const fetch = require("node-fetch"); // Make sure to require the 'node-fetch' library
const { Client, LocalAuth, MessageMedia } = require("whatsapp-web.js");
const regex = /^\/spam @(\d+)\s(.+)/;
const offensiveWords = ["anjg", "anjir", "anj"];

const whatsapp = new Client({
  authStrategy: new LocalAuth(),
});

whatsapp.on("qr", (qr) => {
  qrcode.generate(qr, { small: true });
  console.log("qr ing");
});

whatsapp.on("ready", () => {
  console.log("Client is ready!");
});

whatsapp.on("message", async (message) => {
  console.log(message.body);
  // filterChat(whatsapp, message, offensiveWords);
  if (message.body === "/help") {
    whatsapp.sendMessage(
      message.from,
      "/help : help \n/joke : send a joke \n/meme : send meme img\n/sticker"
    );
  } else if (message.body === "/balance") {
    whatsapp.sendMessage(message.from, "Your balance is : $500");
  } else if (message.body === "/joke") {
    const pesan = await getJoke();
    console.log(message.from);
    whatsapp.sendMessage(message.from, pesan);
  } else if (message.body == "/randomPicker") {
    await handleRandomPickerCommand(whatsapp, message);
  } else if (message.body == "/meme") {
    sendImageMessage(whatsapp, message);
  } else if (message.body == "/sticker") {
    sendStickerFromImage(whatsapp, message);
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

const getJokeImg = async () => {
  const response = await fetch(
    "https://candaan-api.vercel.app/api/image/random"
  );
  const data = await response.json();
  const joke = String(data.data.url);
  return joke;
};

const filterChat = async (whatsapp, message, offensiveWords) => {
  const groupId = message.from;
  const senderId = message.author || message.from;
  const messageBody = message.body.toLowerCase(); // Convert to lowercase for case-insensitive comparison

  // Check if the message contains any offensive words (you can replace this with your list of offensive words from a JSON file)
  const containsOffensiveWord = offensiveWords.some((word) =>
    messageBody.includes(word)
  );

  let censoredMsg = sensorKataKasar(message.body, offensiveWords);

  if (containsOffensiveWord) {
    // Delete the offensive message
    whatsapp.sendMessage(groupId, "badword filter : " + censoredMsg);
    message.delete(groupId);
  }
};

function sensorKataKasar(kalimat, offensiveWords) {
  // Pisahkan kalimat menjadi array kata
  const kataArray = kalimat.split(" ");

  // Ganti setiap kata kasar dengan karakter '*' sejumlah karakter pada kata tersebut
  kataArray.forEach((kata, index) => {
    if (offensiveWords.includes(kata.toLowerCase())) {
      kataArray[index] = "*".repeat(kata.length);
    }
  });

  // Gabungkan kembali array kata menjadi kalimat
  const kalimatSetelahSensor = kataArray.join(" ");

  return kalimatSetelahSensor;
}

function isImageUrlAccessible(url) {
  return axios
    .head(url)
    .then(
      (response) =>
        response.status === 200 &&
        response.headers["content-type"].startsWith("image")
    )
    .catch(() => false);
}

async function sendImageMessage(whatsapp, message) {
  let urlImg;

  do {
    urlImg = await getJokeImg();

    const isAccessible = await isImageUrlAccessible(urlImg);

    if (isAccessible) {
      const media = await MessageMedia.fromUrl(urlImg);
      await whatsapp.sendMessage(message.from, media, { caption: "" });
      break;
    } else {
      console.log("Image URL is not accessible. Trying again.");
      // Handle the case where the image URL is not accessible (retry or send an alternative message)
    }
  } while (true);
}

async function sendStickerFromImage(whatsapp, message) {
  try {
    if (message.hasMedia) {
      const media = await message.downloadMedia();

      const pngFilePath = "sticker.png";
      fs.writeFileSync(pngFilePath, media.data, "base64");

      // Convert PNG file to sticker
      const stickerMedia = MessageMedia.fromFilePath(pngFilePath, {
        sendMediaAsSticker: true,
      });

      // Send the sticker
      await whatsapp.sendMessage(message.from, stickerMedia, {
        sendMediaAsSticker: true,
      });

      // Delete the PNG file
      fs.unlinkSync("sticker.png");
      console.log("PNG file deleted successfully.");
    }
  } catch (error) {
    console.error("Error processing image and sending sticker:", error);
  }
}

whatsapp.initialize();
