import * as pptr from 'puppeteer';
import {DictionaryItem} from "./Dictionary";

export class PuppeteerAbstraction {
    private browser!: pptr.Browser;
    private page!: pptr.Page;

    private constructor() {
    }

    /**
     * Creates a new instance of PuppeteerAbstraction by launching a new browser and creating a new page.
     */
    public static async create(): Promise<PuppeteerAbstraction> {
        const puppeteerAbstraction: PuppeteerAbstraction = new PuppeteerAbstraction();
        puppeteerAbstraction.browser = await pptr.launch({
            headless: process.env.HEADLESS === 'true',
            defaultViewport: null,
        });

        puppeteerAbstraction.page = await puppeteerAbstraction.browser.newPage();
        return puppeteerAbstraction;
    }

    /**
     * Go to the specified url
     * @param url the url to go to
     */
    public async goTo(url: string): Promise<void> {
        await this.page.goto(url, { waitUntil: 'networkidle2'});
    }

    /**
     * Type the content in the targeted input
     * @param target the selector of the input
     * @param content the content to type
     */
    public async type(target: string, content: string): Promise<void> {
        await this.page.type(target, content);
    }

    /**
     * Click on the targeted element
     * @param target the selector of the element to click
     */
    public async click(target: string): Promise<void> {
        await this.page.click(target);
    }

    /**
     * Hit the Enter key
     */
    public async hitEnter(): Promise<void> {
        await this.page.keyboard.press('Enter');
    }

    /**
     * Wait for the specified time
     * @param time in seconds
     */
    public wait(time: number): Promise<void> {
        return new Promise(function (resolve) {
            setTimeout(resolve, time * 1000);
        });
    }

    /**
     * Get the content of the specified element
     * @param selector the selector of the element
     */
    public async getOnPage(selector: string): Promise<string | undefined> {
        return await this.page.evaluate((selector: string) => {
            let e: Element | null = document.querySelector(selector);
            return e?.innerHTML;
        }, selector);
    }

    /*
     * ===================
     * === SHORT CUTS ====
     * ===================
     */

    /**
     * Read the all the words on the page and return them as a list of DictionaryItem
     */
    public async getDictionary(): Promise<DictionaryItem[]> {
        return await this.page.evaluate(() => {
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

    /**
     * Choose the revising mode while being on the test page
     */
    public async chooseRevisingMode() {
        try {
            await this.page.click(".button.small.dropdown-toggle");
            await this.page.click("a[accesskey='o']");
        } catch (error) {
            console.log(error);
        }
    }
}