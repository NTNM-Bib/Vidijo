import { IJournal } from './journal.interface';
import { ICategory } from './category.interface';


export interface IJournalsPage {
    availableCategories?: ICategory[];
    category?: ICategory;
    journals?: IJournal[];
    sort?: "+title" | "-latestPubdate" | "-added" | "-views";
}
