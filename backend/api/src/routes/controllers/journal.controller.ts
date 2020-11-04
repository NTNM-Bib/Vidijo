import ApiConfig from "../../api.config";
import { Request, Response, NextFunction } from "express";
import { IJournal, IArticle } from "../../shared/interfaces";
import { Journal, Article } from "../../shared/models";
import Boom from "@hapi/boom";
import Axios from "axios";
import EscapeStringRegexp from "escape-string-regexp";
import Logger from "../../shared/logger";

const MongoQueryString = require("mongo-querystring");
const MongoQS = new MongoQueryString({
  custom: {
    after: "added",
    before: "added",
    between: "added",
  },
});

class JournalController {
  // Create a new journal
  // When created, search its cover
  // Also search and add articles
  public async createJournal(req: Request, res: Response, next: NextFunction) {
    Axios.post(`${ApiConfig.EXTERNAL_DATA_SERVICE_URI}/v1/journals`, req.body)
      .then(() => {
        return res.status(200).json({ created: true });
      })
      .catch(next);
  }

  // Get journals using a query string
  public async getJournals(req: Request, res: Response, next: NextFunction) {
    let reqQuery: any = req.query;

    // Remove sorting, limit, selection, population & search from the query
    let sort: string = reqQuery.sort ? reqQuery.sort : "";
    reqQuery.sort = undefined;

    const DEFAULT_LIMIT: number = 50;
    let limit: number = reqQuery.limit ? +reqQuery.limit : DEFAULT_LIMIT;
    limit = limit > DEFAULT_LIMIT ? DEFAULT_LIMIT : limit;
    reqQuery.limit = undefined;

    let select: string = reqQuery.select ? reqQuery.select : "";
    reqQuery.select = undefined;

    let populate: string = reqQuery.populate ? reqQuery.populate : "";
    reqQuery.populate = undefined;

    let populateSelect: string = reqQuery.populateSelect
      ? reqQuery.populateSelect
      : "";
    reqQuery.populateSelect = undefined;

    let page: number = reqQuery.page ? reqQuery.page : 1;
    reqQuery.page = undefined;

    let search: string = reqQuery.search ? reqQuery.search : "";
    reqQuery.search = undefined;

    // Parse find conditions from remaining query
    let findQuery = MongoQS.parse(reqQuery);
    Logger.debug(findQuery);

    // Build search query for multiple search terms
    let searchTerms: string[] = search.split(" ");
    let searchQuery = {
      $and: [] as any[],
    };

    for (let searchTerm of searchTerms) {
      searchTerm = EscapeStringRegexp(searchTerm);
      console.log(searchTerm);
      searchQuery.$and.push({
        $or: [
          {
            title: {
              $regex: `\\b${searchTerm}`,
              $options: "i",
            },
          },
          {
            issn: {
              $regex: `\\b${searchTerm}`,
              $options: "i",
            },
          },
          {
            eissn: {
              $regex: `\\b${searchTerm}`,
              $options: "i",
            },
          },
        ],
      } as any);
    }

    // Change findQuery if query contains "search"
    if (search && search !== "") {
      findQuery = {
        $and: [findQuery, searchQuery],
      };
    }

    // Execute
    const paginationOptions = {
      populate: { path: populate, select: populateSelect },
      select: select,
      sort: sort,
      collation: { locale: "en" },
      limit: limit,
      page: page,
    };

    Journal.paginate(findQuery, paginationOptions)
      .then((journalsPage: any) => {
        return res.status(200).json(journalsPage);
      })
      .catch((err: Error) => {
        return next(err);
      });
  }

  // Get a journal by its id
  public getJournal(req: Request, res: Response, next: NextFunction) {
    const id: string = req.params.id;

    Journal.findOne({ _id: id })
      .exec()
      .then((journal: IJournal | null) => {
        if (!journal) {
          return next(Boom.notFound(`Journal ${id} does not exist`));
        }
        journal.incViews();
        return res.status(200).json(journal);
      })
      .catch((err) => {
        return next(err);
      });
  }

  // PATCH journal entity with given id
  public patchJournal(req: Request, res: Response, next: NextFunction) {
    const id: string = req.params.id;
    const update = req.body;

    Journal.findByIdAndUpdate(id, update)
      .exec()
      .then((patchedJournal: IJournal | null) => {
        if (!patchedJournal) {
          return next(Boom.notFound(`Journal ${id} does not exist`));
        }
        return res.status(200).json(patchedJournal);
      })
      .catch((err) => {
        return next(err);
      });
  }

  // DELETE a journal by its id
  public deleteJournal(req: Request, res: Response, next: NextFunction) {
    const id: string = req.params.id;

    Journal.deleteOne({ _id: id })
      .exec()
      .then((result) => {
        return res.status(200).json(result);
      })
      /*
      .then((deletedJournal: IJournal | null) => {
        if (!deletedJournal) {
          return next(Boom.notFound(`Journal ${id} does not exist`));
        }
        return res.status(200).json(deletedJournal);
      })
      */
      .catch((err) => {
        return next(err);
      });
  }

  // Get articles of a journal by its id
  public getArticles(req: Request, res: Response, next: NextFunction) {
    const id: string = req.params.id;

    Article.find({ publishedIn: id })
      .sort("+pubdate")
      .exec()
      .then((articles: IArticle[] | null) => {
        if (!articles) {
          return next(
            Boom.notFound(`Journal with ${id} does not contain any articles`)
          );
        }
        return res.status(200).json(articles);
      })
      .catch((err) => {
        return next(err);
      });
  }
}

export default new JournalController();
