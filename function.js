const axios = require("axios");
const ytdl = require("ytdl-core");
const fs = require("fs");
const { MessageMedia } = require("whatsapp-web.js");
const fetch = require("node-fetch"); // Make sure to require the 'node-fetch' library
const regex = /^\/spam @(\d+)\s(.+)/;
const offensiveWords = ["anjg", "anjir", "anj"];

const getJoke = async () => {
  const response = await fetch(
    "https://joke-bapak-api.vercel.app/api/text/random"
  );
  const data = await response.json();
  const joke = String(data.data);
  return joke;
};

const getJokeImg = async () => {
  const response = await fetch(
    "https://joke-bapak-api.vercel.app/api/image/random"
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
      await whatsapp.sendMessage(message.from, media, {
        caption: "",
        isViewOnce: true,
      });
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
        stickerAuthor: "dheep",
      });
    }
  } catch (error) {
    console.error("Error processing image and sending sticker:", error);
  }
}

const downloadAudio = async (url) => {
  // Download audio using ytdl-core
  const audioInfo = await ytdl.getInfo(url);
  const audioReadableStream = ytdl(url, { filter: "audioonly" });
  const chunks = [];

  return new Promise((resolve, reject) => {
    audioReadableStream.on("data", (chunk) => chunks.push(chunk));
    audioReadableStream.on("end", () => resolve(Buffer.concat(chunks)));
    audioReadableStream.on("error", reject);
  });
};

const sendVoiceNote = async (whatsapp, message, audioBuffer) => {
    // Save the audio buffer to a temporary file
    const fileName = "audio.mp3";
    fs.writeFileSync(fileName, audioBuffer);

    // Create a MessageMedia object from the audio file
    const media = MessageMedia.fromFilePath(fileName, {
      sendAudioAsVoice: true,
    });

    // Send the voice note
    await whatsapp.sendMessage(message.from, media, { sendAudioAsVoice: true });

    // Delete the temporary file
    fs.unlinkSync(fileName);

};

module.exports = {
  getJoke,
  getJokeImg,
  sendImageMessage,
  sendStickerFromImage,
  downloadAudio,
  sendVoiceNote,
};
