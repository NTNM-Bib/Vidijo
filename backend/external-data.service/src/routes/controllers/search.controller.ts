import { Request, Response, NextFunction } from "express";
import { IJournal } from "../../shared/interfaces";
import Boom from "@hapi/boom";
import { JournalCollector } from "../../collectors";


class SearchController {

  // Search journals in 3rd party services
  public async searchJournals(req: Request, res: Response, next: NextFunction) {
    const query: any = req.query;
    const term: string = query.term ? query.term : undefined;

    if (!term) {
      return next(Boom.badRequest("search term (e.g. ?term='Biology') is missing"));
    }

    JournalCollector.searchJournals(term)
      .then((searchResults: IJournal[]) => {
        return res.status(200).json(searchResults);
      })
      .catch(err => {
        return next(err);
      });
  }
}


export default new SearchController();
