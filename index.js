const puppeteer = require("puppeteer");
require("dotenv").config();

const memrise_url = "https://app.memrise.com/signin"
const course_url = "https://app.memrise.com/course/2233959/3a-s1-polytech-nantes/";

function delay(time) {
  return new Promise(function (resolve) {
    setTimeout(resolve, time)
  });
}

function getTranslation(dico, word) {
  let res = "";
  dico.forEach(w => {
    if (w.original == word) {
      res = w.translated;
    }

    if (w.translated == word) {
      res = w.original;
    }
  })
  return res;
}

(async () => {

  // Initialisation
  const browser = await puppeteer.launch({ headless: false, defaultViewport: null });
  const page = await browser.newPage();

  await page.goto(memrise_url, { waitUntil: "networkidle2" });

  await page.type("input[id='username']", process.env.USER_NAME, { delay: 1 })
  await page.type("input[id='password']", process.env.USER_PASSWORD, { delay: 1 })
  await page.click("button[data-testid='signinFormSubmit']");

  await delay(2000);
  await page.goto(course_url, { waitUntil: "networkidle2" });
  await page.click(".cc-btn.cc-allow");

  let pathname = "/" + course_url.split("/").splice(3, 3).join("/") + "/";
  let current_course = pathname + "1/";
  let selector = "a[href='" + current_course + "']"
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
    for (let i = 0; i < motsBrut.length; i = i + 2) {
      mots.push({
        original: motsBrut[i],
        translated: motsBrut[i + 1]
      })
    }
    return mots
  });

  // Main loop
  try {
    await page.click("a.btn.btn-light-green");
  } catch (error) {
    console.log("No light green button :", error)
  }

  try {
    await page.click(".actions.actions-right > a");
  } catch (error) {
    console.log("No simple button :", error)
  }
  
  await delay(2000);

  let currentWord = await page.evaluate(() => {
    let e = document.querySelector("h2.sc-9f618z-2.jIuOsE");
    return e.innerText
  });



  let letterCase = await page.evaluate(() => {
    let e = document.querySelector(".sc-ojuw87-1.kclydn");
    if (e) {
      return e.innerText
    }
    return null
  });

  let wordCase = await page.evaluate(() => {
    let e = document.querySelector(".sc-7v3i35-1.cmZgNh");
    if (e) {
      return e.innerText
    }
    return null
  });

  let sentenceCase = await page.evaluate(() => {
    let e = document.querySelector(".sc-1opiu1v-0.dzOzSf");
    if (e) {
      return e.innerText
    }
    return null
  });

  const translation = getTranslation(dico, currentWord);
  console.log("Translation :", translation)

  if (letterCase) {
    await page.type(".sc-ojuw87-2.TpKoe", translation, { delay: 1 })
    await page.click(".sc-bdfBQB.kMSUVe")
  }

  if (wordCase) {
    console.log("wordCase :", wordCase)
    let translationSplited = translation.split(" ");
    let currentWordSplited = currentWord.split(" ");


    
  }

  if (sentenceCase) {

    let sentences = await page.evaluate(() => {
      let els = document.querySelectorAll(".sc-bdfBQB.dvaGCW");
      els.forEach(e => {
        if (e.innerText.includes(translation)) {

        }
      })
    });
  }






  //await browser.close();
})();