export interface IArticle {
  _id: string;
  doi: string;
  publishedIn: any;
  title: string;
  authors: string[];
  abstract: string;
  source: string;
  pubdate: Date;
  updated: Date;
}
