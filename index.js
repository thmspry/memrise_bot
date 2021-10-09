const puppeteer = require("puppeteer");
require("dotenv").config();

const memrise_url = "https://app.memrise.com/signin"
const course_url = "https://app.memrise.com/course/2233959/3a-s1-polytech-nantes/";

function delay(time) {
  return new Promise(function(resolve) { 
      setTimeout(resolve, time)
  });
}

(async () => {
  const browser = await puppeteer.launch({ headless : false});
  const page = await browser.newPage();

  await page.goto(memrise_url, {waitUntil: "networkidle2"});

  await page.type("input[id='username'", process.env.USER_NAME, {delay: 75})
  await page.type("input[id='password'", process.env.USER_PASSWORD, {delay: 75})
  await page.click("button[data-testid='signinFormSubmit']");

  await delay(2000);
  await page.goto(course_url, {waitUntil: "networkidle2"});
  await page.click(".cc-btn.cc-allow");
  

  //await browser.close();
})();