import { IArticle } from "./article.interface";
import { ICategory } from "./category.interface";

export interface IJournal {
  _id: string;
  title: string;
  issn: string;
  eissn: string;
  source: string;
  cover: string;
  useGeneratedCover: boolean;
  articles: IArticle[];
  added: Date;
  latestPubdate: Date;
  updated: Date;
  views: number;
  categories: any[];
  newestArticles: IArticle[];
}
