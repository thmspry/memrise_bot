import exp_env_info from './config/expected_env_variables.json';
import {EnvVariable, EnvVariableInfo} from "./model/EnvVariable";
import {UrlUtils} from "./utils/url-utils";
import {DictionaryItem, Dictionary} from "./model/Dictionary";
import {PuppeteerAbstraction} from "./model/PuppeteerAbstraction";

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

async function run(): Promise<void> {

    // STEP 0 : Create Bot
    const bot: PuppeteerAbstraction = await PuppeteerAbstraction.create();
    const courseUrl: string = process.env.COURSE_URL!;
    await bot.goTo(courseUrl);

    // STEP 1 : Login
    await bot.type("input[id='username']", process.env.USER_NAME!);
    await bot.type("input[id='password']", process.env.USER_PASSWORD!);
    await bot.click("button[data-testid='signinFormSubmit']");
    await bot.wait(5);
    await bot.click(".cc-btn.cc-allow"); // Allow cookies

    // STEP 2 : Go to the first course
    const firstCourseUrl: string = UrlUtils.getFirstCourseUrl(courseUrl);
    await bot.goTo(firstCourseUrl);

    // STEP 3 : Learn the words
    const dictionaryItems: DictionaryItem[] = await bot.getDictionary();
    const dictionary: Dictionary = new Dictionary(dictionaryItems);
    console.log(`${dictionary.size()} words learned !`);
    await bot.wait(1);

    // STEP 4 : Go to test, in revising mode
    await bot.chooseRevisingMode();
    await bot.wait(4);

    // STEP 5 : Loop on test
    while (true) {
        let currentWord: string | undefined = "something";
        await bot.wait(2);

        while (currentWord != null) { // Loop for each question
            currentWord = await bot.getOnPage('h2[data-testid="learn-prompt-text"] span');
            const translation: string = dictionary.getTranslation(currentWord!);  // Get the answer of the question

            await bot.type("input[data-testid='typing-response-input']", translation)
                .catch(() => console.log("Error while typing the answer"));

            await bot.hitEnter(); // Go to next question
        }

        await bot.wait(1);

        // Go back to the course page
        await bot.goTo(firstCourseUrl);
        await bot.wait(1);

        await bot.chooseRevisingMode(); // Go to revising mode
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
