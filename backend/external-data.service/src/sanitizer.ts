import { IArticle } from "./shared/interfaces";
import HtmlToText from "html-to-text";


const htmlToTextOptions: HtmlToTextOptions = {
    wordwrap: false
}


export async function sanitizeArticle(article: IArticle): Promise<IArticle> {
    const promise: Promise<IArticle> = new Promise<IArticle>(async (resolve, reject) => {
        let sanitizedArticle: IArticle;

        sanitizedArticle = await sanitizeTitle(article).catch();
        sanitizedArticle = await sanitizeAbstract(article).catch();

        return resolve(sanitizedArticle);
    });

    return promise;
}


export async function sanitizeTitle(article: IArticle): Promise<IArticle> {
    const promise: Promise<IArticle> = new Promise<IArticle>((resolve, reject) => {
        if (!article.title) {
            return resolve(article);
        }
        const rawTitle: string = article.title;

        // Remove HTML tags & replace encoded strings with UTF-8 characters
        const sanitizedTitle: string = HtmlToText.fromString(rawTitle, htmlToTextOptions);

        article.title = sanitizedTitle;

        return resolve(article);
    });

    return promise;
}


export async function sanitizeAbstract(article: IArticle): Promise<IArticle> {
    const promise: Promise<IArticle> = new Promise<IArticle>((resolve, reject) => {
        if (!article.abstract) {
            return resolve(article);
        }
        const rawAbstract: string = article.abstract;

        // Remove HTML tags & replace encoded strings with UTF-8 characters
        const sanitizedAbstract: string = HtmlToText.fromString(rawAbstract, htmlToTextOptions);

        article.abstract = sanitizedAbstract;

        return resolve(article);
    });

    return promise;
}