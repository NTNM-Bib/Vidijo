import { IArticle } from "./article.interface";
import { IJournal } from './journal.interface';


export interface IHomePage {
    recentlyUpdatedFavoriteJournals?: IJournal[];
    lastReadingListArticles?: IArticle[];
    favoriteJournals?: IJournal[];
}
