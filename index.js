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
  const browser = await puppeteer.launch({ headless : false, defaultViewport: null});
  const page = await browser.newPage();

  await page.goto(memrise_url, {waitUntil: "networkidle2"});

  await page.type("input[id='username'", process.env.USER_NAME, {delay: 1})
  await page.type("input[id='password'", process.env.USER_PASSWORD, {delay: 1})
  await page.click("button[data-testid='signinFormSubmit']");

  await delay(2000);
  await page.goto(course_url, {waitUntil: "networkidle2"});
  await page.click(".cc-btn.cc-allow");

  let pathname = "/" + course_url.split("/").splice(3,3).join("/") + "/";
  let current_course = pathname + "1/";
  let selector = "a[href='"+ current_course + "']" 
  await page.click(selector);

  let data = await page.evaluate(() => {
    return document.querySelector(".thing.text-text > .col.text > .text").innerHTML;
  });

  console.log(data)
  
  
  

  //await browser.close();
})();