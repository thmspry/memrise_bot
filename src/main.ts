import pptr from 'puppeteer';
import exp_env_info from './config/expected_env_variables.json';
import {EnvVariable, EnvVariableInfo} from "./model/EnvVariable";

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


