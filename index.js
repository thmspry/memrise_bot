const puppeteer = require("puppeteer");
require("dotenv").config();

const url_test = "https://app.memrise.com/course/2233959/3a-s1-polytech-nantes/";

(async () => {
  const browser = await puppeteer.launch({ headless : false});
  const page = await browser.newPage();
  await page.goto(url_test, {waitUntil: "networkidle2"});

  await browser.close();
})();