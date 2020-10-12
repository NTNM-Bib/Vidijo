import { Document, Model, PaginateModel } from "mongoose";


interface IArticleDocument extends Document {
    doi: string;
    publishedIn: any;
    title: string;
    authors: string[];
    abstract: string;
    source: string;  // Virtual: https://doi.org/{{this.doi}}
    pubdate: Date;
}


export interface IArticle extends IArticleDocument {
}


export interface IArticleModel extends Model<IArticle>, PaginateModel<IArticle> {
}