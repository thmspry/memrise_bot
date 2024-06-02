export class Dictionary {
    private items: DictionaryItem[];

    constructor(items: DictionaryItem[]) {
        this.items = items;
    }

    public size(): number {
        return this.items.length;
    }

    /**
     * Give the translation of a word
     * @param word : string the word to be translated
     * @returns {string} the translation
     */
    public getTranslation(word: string): string {
        let translation: string = "";
        this.items.forEach((item: DictionaryItem): void => {
            if (item.original === word) {
                translation = item.translated;
            }
            if (item.translated === word) {
                translation = item.original;
            }
        });

        return translation;
    }
}

export type DictionaryItem = {
    original: string;
    translated: string;
}