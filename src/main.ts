import pptr from 'puppeteer';
import exp_env_info from './config/expected_env_variables.json';
import {EnvVariables} from "./model/EnvVariable";

function checkEnvVariables(): void {

    const expectedVariables: EnvVariables[] = [
        { ...exp_env_info[0], value: process.env.USER_NAME ?? '' },
        { ...exp_env_info[1], value: process.env.USER_PASSWORD ?? '' },
        { ...exp_env_info[2], value: process.env.COURSE_URL ?? '' },
        { ...exp_env_info[3], value: process.env.HEADLESS ?? '' },
    ];

    const variableMissing: EnvVariables[] = expectedVariables.filter((variable: EnvVariables): boolean => variable.value === '');

    if (variableMissing.length > 0) {
        let errorMessage: string = `The following environment variable${variableMissing.length > 1 ? 's': '' } are missing in the .env file:`;

        variableMissing.forEach((variable: EnvVariables): void => {
            errorMessage += `\n- ${variable.name} : ${variable.description}`;
        });

        errorMessage += '\nRead the README.md file for more information.';
        throw new Error(errorMessage);
    }
}

async function run(): Promise<void> {
    const browser: pptr.Browser = await pptr.launch({
        headless: process.env.HEADLESS === 'true',
        defaultViewport: null,
    });
    const page: pptr.Page = await browser.newPage();
    await page.goto(process.env.COURSE_URL!, { waitUntil: 'networkidle2' });

    await browser.close();
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


