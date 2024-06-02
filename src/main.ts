import pptr from 'puppeteer';
import exp_env_info from './config/expected_env_variables.json';
import {EnvVariable, EnvVariableInfo} from "./model/EnvVariable";
import {UrlUtils} from "./utils/url-utils";
import {DictionaryItem, Dictionary} from "./model/Dictionary";

function checkEnvVariables(): void {

    const envVariablesValues: string[] = [
        process.env.USER_NAME ?? '',
        process.env.USER_PASSWORD ?? '',
        process.env.COURSE_URL ?? '',
        process.env.HEADLESS ?? ''
    ];

    const expectedVariables: EnvVariable[] = exp_env_info.map((env_info: EnvVariableInfo, index: number): EnvVariable => {
        return { ...env_info, value: envVariablesValues[index]} as EnvVariable
    });

    const variableMissing: EnvVariable[] = expectedVariables.filter((variable: EnvVariable): boolean => variable.value === '');

    if (variableMissing.length > 0) {
        let errorMessage: string = `The following environment variable${variableMissing.length > 1 ? 's': '' } are missing in the .env file:`;

        variableMissing.forEach((variable: EnvVariable): void => {
            errorMessage += `\n- ${variable.name} : ${variable.description}`;
        });

        errorMessage += '\nRead the README.md file for more information.';
        throw new Error(errorMessage);
    }
}

async function delay(time: number) {
    return new Promise(function (resolve) {
        setTimeout(resolve, time);
    });
}

async function getDictionary(page: pptr.Page): Promise<DictionaryItem[]> {
    return await page.evaluate(() => {
        let els: Element[] = [...document.querySelectorAll(".thing.text-text > .col.text > .text")];

        const tableItems: string[] = els.map((e: Element) => e.innerHTML);

        const dictionaryItems: DictionaryItem[] = [];

        for(let i: number = 0; i < tableItems.length; i = i + 2) {
            const dictionaryItem: DictionaryItem = {
                original: tableItems[i],
                translated: tableItems[i + 1]
            }
            dictionaryItems.push(dictionaryItem);
        }
        return dictionaryItems;
    });
}

async function chooseRevisingMode(page: pptr.Page) {
    try {
        await page.click(".button.small.dropdown-toggle");
        await page.click("a[accesskey='o']");
    } catch (error) {
        console.log(error);
    }
}

async function run(): Promise<void> {
    const browser: pptr.Browser = await pptr.launch({
        headless: process.env.HEADLESS === 'true',
        defaultViewport: null,
    });

    const page: pptr.Page = await browser.newPage();

    const courseUrl: string = process.env.COURSE_URL!;

    await page.goto(courseUrl, { waitUntil: 'networkidle2'});

    // Login
    await page.type("input[id='username']", process.env.USER_NAME!);
    await page.type("input[id='password']", process.env.USER_PASSWORD!);
    await page.click("button[data-testid='signinFormSubmit']");

    await delay(5 * 1000);

    await page.click(".cc-btn.cc-allow"); // Allow cookies

    const firstCourseUrl: string = UrlUtils.getFirstCourseUrl(courseUrl);
    await page.goto(firstCourseUrl, { waitUntil: 'networkidle2'});

    const dictionaryItems: DictionaryItem[] = await getDictionary(page);
    const dictionary: Dictionary = new Dictionary(dictionaryItems);
    console.log(`${dictionary.size()} words learned !`);

    await delay(1000);

    // STEP 3 : Go to test, in revising mode
    await chooseRevisingMode(page);

    await delay(4000);

    // STEP 4 : Loop on test
    while (true) {
        let currentWord: string | undefined = "something";

        await delay(2000); // value to be modified according to your internet connection speed

        while (currentWord != null) { // Loop for each question

            currentWord = await page.evaluate(() => { // Get the current word in the question
                let e: Element | null = document.querySelector('h2[data-testid="learn-prompt-text"] span');
                return e?.innerHTML;
            });

            const translation: string = dictionary.getTranslation(currentWord!);  // Get the answer of the question

            try { // Type the answer
                await page.type("input[data-testid='typing-response-input']", translation);
            } catch (error) {
                console.log("Can't type " + translation + " in input")
            }

            await page.keyboard.press('Enter'); // Go to the next question
        }

        await delay(1000);

        // Go back to the course page
        await page.goto(firstCourseUrl, { waitUntil: 'networkidle2'});
        await delay(1000);

        await chooseRevisingMode(page); // Go to revising mode
    }
}

require("dotenv").config({path: "./src/config/.env"});

try {
    checkEnvVariables();

    run().catch(error => {
        console.error(error);
        process.exit(1);
    });
} catch (error) {
    console.error(error);
}
