import { IJournal } from './journal.interface';
import { ICategory } from './category.interface';


export interface IDiscoverPage {
    recentlyUpdatedJournals?: IJournal[];
    topCategories?: ICategory[];
    recentlyAddedJournals?: IJournal[];
    mostViewedJournals?: IJournal[];
}
