const axios = require("axios");

let i = 0;

async function makeRequest() {
  try {
    const response = await axios.get(
      "https://camo.githubusercontent.com/c8084858a69a2aedd7ef060c2c9f01d169859fe54b662f0d1b978ab2fc8112b2/68747470733a2f2f70726f66696c652d636f756e7465722e676c697463682e6d652f4468697447542f636f756e742e7376673f"
    );
    i++;
    console.log(`Request ${i} status: ${response.status}`);
  } catch (error) {
    console.error(`Error making request ${i}:`, error.message);
  }
}

(async () => {
  while (i < 1000) {
    await makeRequest();
  }
})();
