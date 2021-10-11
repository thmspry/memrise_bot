const puppeteer = require("puppeteer");
require("dotenv").config();

const memrise_url = "https://app.memrise.com/signin";
const course_url =
  "https://app.memrise.com/course/2233959/3a-s1-polytech-nantes/";

function delay(time) {
  return new Promise(function (resolve) {
    setTimeout(resolve, time);
  });
}

function getTranslation(dico, word) {
  let res = "";
  dico.forEach((w) => {
    if (w.original == word) {
      res = w.translated;
    }

    if (w.translated == word) {
      res = w.original;
    }
  });
  return res;
}

(async () => {
  
  // Initialisation
  const browser = await puppeteer.launch({
    headless: false,
    defaultViewport: null,
  });
  const page = await browser.newPage();

  await page.goto(memrise_url, { waitUntil: "networkidle2" });

  await page.type("input[id='username']", process.env.USER_NAME);
  await page.type("input[id='password']", process.env.USER_PASSWORD);
  await page.click("button[data-testid='signinFormSubmit']");

  await delay(2000);
  await page.goto(course_url, { waitUntil: "networkidle2" });
  await page.click(".cc-btn.cc-allow");

  let pathname = "/" + course_url.split("/").splice(3, 3).join("/") + "/";
  let current_course = pathname + "1/";
  let selector = "a[href='" + current_course + "']";
  await page.click(selector);

  await delay(2000);

  // Words learning
  let dico = await page.evaluate(() => {
    let motsBrut = [];
    let mots = [];
    let els = document.querySelectorAll(".thing.text-text > .col.text > .text");
    els.forEach((e) => {
      motsBrut.push(e.innerText);
    });
    for (let i = 0; i < motsBrut.length; i = i + 2) {
      mots.push({
        original: motsBrut[i],
        translated: motsBrut[i + 1],
      });
    }
    return mots;
  });

  // Go to test
  try {
    await page.click("a.btn.btn-light-green");
  } catch (error) {
    try {
      await page.click(".actions.actions-right > a");
    } catch (error) {
      console.log("No button :", error);
    }
  }
  

  // Main loop
  while (true) {
    let end = null;

    while (end == null) {
      await delay(50);

      let currentWord = await page.evaluate(() => {
        let e = document.querySelector("h2.sc-9f618z-2.jIuOsE");
        if (e) {
          return e.innerText;
        }
        return null;
      });

      let letterCase = await page.evaluate(() => {
        let e = document.querySelector(".sc-ojuw87-1.kclydn");
        if (e) {
          return e.innerText;
        }
        return null;
      });

      let wordCase = await page.evaluate(() => {
        let e = document.querySelector(".sc-7v3i35-1.cmZgNh");
        if (e) {
          return e.innerText;
        }
        return null;
      });

      let sentenceCase = await page.evaluate(() => {
        let e = document.querySelector(".sc-1opiu1v-0.dzOzSf");
        if (e) {
          return e.innerText;
        }
        return null;
      });

      let errorCase = await page.evaluate(() => {
        let e = document.querySelector(".sc-bdfBQB.kMSUVe .sc-kEjbQP.fznHZw");
        if (e) {
          if (e.innerText.includes("Suivant")) {
            return e.innerText;
          }
          return null;
        }
        return null;
      })

      let translation = getTranslation(dico, currentWord);

      if (letterCase) {
        await page.type(".sc-ojuw87-2.TpKoe", translation);
        await page.click(".sc-bdfBQB.kMSUVe");
      }

      if (wordCase) {
        const translationSplited = translation.split(" ");
        for (i = 0; i < translationSplited.length; i++) {
          delay(100);
          await page.evaluate(
            (translationSplited, i) => {
              let els = document.querySelectorAll(".sc-7v3i35-1.cmZgNh > .sc-1i3aukn-0.eJVwvp");
              els.forEach((e) => {
                if (e.innerText == translationSplited[i]) {
                  e.click();
                }
              });
            },
            translationSplited,
            i
          );
        }
      }

      if (sentenceCase) {
        await page.evaluate((translation) => {
          let els = document.querySelectorAll(".sc-bdfBQB.dvaGCW");
          els.forEach((e) => {
            if (e.innerText == translation) {
              e.click();
            }
          });
        }, translation);
      }

      if(errorCase) {
        await page.click(".sc-bdfBQB.kMSUVe")
      }

      try {
        await page.click(".sc-bdfBQB.hwxFJf");
      } catch (error) {
      }

      

      end = await page.evaluate(() => {
        let e = document.querySelector(".sc-e5k3hh-5.bhEYJf");
        if (e) {
          return e.innerText;
        }
        return null;
      });
    }

    await page.goto(course_url, { waitUntil: "networkidle2" });

    await page.click(selector);

    try {
      await page.click("a.btn.btn-light-green");
    } catch (error) {
      try {
        await page.click(".actions.actions-right > a");
      } catch (error) {
        console.log("No button :", error);
      }
    }

    end = null;
  }

  //await browser.close();
})();
