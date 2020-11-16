import { Request, Response, NextFunction } from "express";
import { IJournal } from "../../shared/interfaces";
import CreateError from "http-errors";
import { JournalCollector } from "../../collectors";

class SearchController {
  // Search journals in 3rd party services
  public searchJournals(req: Request, res: Response, next: NextFunction) {
    const query: any = req.query;
    const term: string = query.term || undefined;

    if (!term)
      throw CreateError(400, "Search term (e.g. ?term='Biology') is missing");

    JournalCollector.searchJournals(term)
      .then((searchResults: IJournal[]) => {
        res.json(searchResults);
      })
      .catch(next);
  }
}

export default new SearchController();
