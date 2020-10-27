import { Request, Response, NextFunction } from "express";
import EscapeStringRegexp from "escape-string-regexp";
import { IArticle } from "../../shared/interfaces";
import { Article } from "../../shared/models";
import Logger from "../../shared/logger";

const MongoQueryString = require("mongo-querystring");
const MongoQS = new MongoQueryString({
  custom: {
    after: "pubdate",
    before: "pubdate",
    between: "pubdate",
  },
});

class ArticleController {
  // GET /articles
  public async getArticles(req: Request, res: Response, next: NextFunction) {
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
      searchQuery.$and.push({
        $or: [
          {
            title: {
              $regex: `\\b${searchTerm}`,
              $options: "i",
            },
          },
          {
            doi: {
              $regex: `\\b${searchTerm}`,
              $options: "i",
            },
          },
          {
            authors: {
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

    Article.paginate(findQuery, paginationOptions)
      .then((articlesPage) => {
        return res.status(200).json(articlesPage);
      })
      .catch((err) => {
        return next(err);
      });
  }

  // GET /article/:id
  public getArticleById(req: Request, res: Response, next: NextFunction) {
    const id: string = req.params.id;

    Article.findOne({ _id: id })
      .exec()
      .then((article: IArticle | null) => {
        return res.status(200).json(article);
      })
      .catch((err) => {
        return next(err);
      });
  }
}
export default new ArticleController();
