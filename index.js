const puppeteer = require("puppeteer");

/**--------------------------
 * ---- GLOBAL VARIABLES ----
 * --------------------------
 */

require("dotenv").config();
const memrise_url = "https://app.memrise.com/signin";
const course_url = process.env.COURSE_URL;

/**--------------------------
 * ---- USEFUL FUNCTIONS ----
 * --------------------------
 */

/**
 * Pause the process
 * @param time : number time in milliseconds
 * @returns {Promise<unknown>}
 */
async function delay(time) {
  return new Promise(function (resolve) {
    setTimeout(resolve, time);
  });
}

/**
 * Give the translation of a word
 * @param dico the dictionary of words
 * @param word : string the word to be translated
 * @returns {string} the translation
 */
function getTranslation(dico, word) {
  let res = "";
  dico.forEach((w) => {
    if (w.original === word) {
      res = w.translated;
    }
    if (w.translated === word) {
      res = w.original;
    }
  });
  return res;
}

/**
 * Macro to launch test in revising mode
 * @param page
 * @returns {Promise<void>}
 */
async function chooseRevisingMode(page) {
  try {
    await page.click(".button.small.dropdown-toggle");
    await page.click("a[accesskey='o']");
  } catch (error) {
    console.log(error);
  }
}


/**---------------------
 * ---- BOT PROCESS ----
 * ---------------------
 */
(async () => {

  // STEP 1 : Initialisation
  const browser = await puppeteer.launch({
    headless: false,
    defaultViewport: null,
  });
  const page = await browser.newPage();

  await page.goto(memrise_url, { waitUntil: "networkidle2" });

  // Login Memrise
  await page.type("input[id='username']", process.env.USER_NAME);
  await page.type("input[id='password']", process.env.USER_PASSWORD);
  await page.click("button[data-testid='signinFormSubmit']");

  await delay(5000); // value to be modified according to your internet connection speed
  await page.goto(course_url, { waitUntil: "networkidle2" });
  await page.click(".cc-btn.cc-allow"); // Allow cookies

  // Go to first test in the course
  let pathname = "/" + course_url.split("/").splice(3, 3).join("/") + "/";
  let current_course = pathname + "1/";
  let selector = "a[href='" + current_course + "']";
  await page.click(selector);

  await delay(2000); // value to be modified according to your internet connection speed

  // STEP 2 : Words learning
  let dico = await page.evaluate(() => {
    let rawWords = [];
    let words = [];
    let els = document.querySelectorAll(".thing.text-text > .col.text > .text");
    els.forEach((e) => {
      rawWords.push(e.innerText);
    });
    for (let i = 0; i < rawWords.length; i = i + 2) {
      words.push({
        original: rawWords[i],
        translated: rawWords[i + 1],
      });
    }
    return words;
  });

  console.log(dico.length + " words learned !")
  await delay(1000);


  // STEP 3 : Go to test, in revising mode
  await chooseRevisingMode(page);


  await delay(4000); // value to be modified according to your internet connection speed


  // STEP 4 : Main loop
  while (true) {
    let currentWord = "something";

    await delay(2000); // value to be modified according to your internet connection speed

    while (currentWord != null) { // Loop for each question

      currentWord = await page.evaluate(() => { // Get the current word in the question
        let e = document.querySelector("h2.sc-af59h9-2.hDpNkj");
        if (e) {
          return e.innerText;
        }
        return null;
      });

      let translation = getTranslation(dico, currentWord);  // Get the answer of the question

      try { // Type the answer
        await page.type("input[data-testid='typing-response-input']", translation);
      } catch (error) {
        console.log("Can't type " + translation + " in input")
      }

      await page.keyboard.press('Enter'); // Go to the next quesiton
    }

    await delay(1000);

    // Go back to the course page
    await page.goto(course_url, { waitUntil: "networkidle2" });
    await page.click(selector);
    await delay(1000);

    await chooseRevisingMode(page); // Go to revising mode

  }
  //await browser.close();
})();