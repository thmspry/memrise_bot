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

  // Initialisation
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

  await delay(2000);

  // Words learning
  let dico = await page.evaluate(() => {
    let motsBrut = []
    let mots = []
    let els = document.querySelectorAll(".thing.text-text > .col.text > .text");
    els.forEach(e => {
      motsBrut.push(e.innerText)
    })
    for(let i=0; i<motsBrut.length; i=i+2) {
      mots.push({
        original: motsBrut[i],
        translated: motsBrut[i+1]
      })
    }
    return mots
  });

  // Main loop
  await page.click("a.btn.btn-light-green");


  console.log(dico)
  
  
  

  //await browser.close();
})();