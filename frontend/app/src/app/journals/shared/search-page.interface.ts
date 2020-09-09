import { ICategory } from './category.interface';
import { IJournal } from './journal.interface';
import { IArticle } from './article.interface';


export interface ISearchPage {
    categories?: ICategory[];
    journals?: IJournal[];
    articles?: IArticle[];
}
