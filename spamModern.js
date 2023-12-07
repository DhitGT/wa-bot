const puppeteer = require("puppeteer");

const url =
  "https://camo.githubusercontent.com/c8084858a69a2aedd7ef060c2c9f01d169859fe54b662f0d1b978ab2fc8112b2/68747470733a2f2f70726f66696c652d636f756e7465722e676c697463682e6d652f4468697447542f636f756e742e7376673f";

async function openLinkMultipleTimes(numRequests) {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();

  for (let i = 0; i < numRequests; i++) {
    await page.goto(url);
    console.log(`Request ${i + 1} completed`);
  }

  await browser.close();
}

// Adjust the number of requests as needed
openLinkMultipleTimes(1000);
