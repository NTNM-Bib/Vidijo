import UserConfig from "../../user.config";
import { Request, Response, NextFunction } from "express";
import Boom from "@hapi/boom";
import Axios from "axios";
import EscapeStringRegexp from "escape-string-regexp";
import { IUser, IJournal, IArticle } from "../../shared/interfaces";
import { User, Journal, Article } from "../../shared/models";
import Logger from "../../shared/logger";


const MongoQueryString = require("mongo-querystring");
/* TODO: Date comparison via last action (last api access)
const MongoQS = new MongoQueryString({
  custom: {
    after: "lastAction",
    before: "lastAction",
    between: "lastAction"
  }
});
*/
const MongoQS = new MongoQueryString();


class UserController {

  // Get all Users
  public getUsers(req: Request, res: Response, next: NextFunction) {
    let reqQuery: any = req.query;

    // Remove sorting, limit, selection, population & search from the query
    let sort: string = reqQuery.sort ? reqQuery.sort : "";
    reqQuery.sort = undefined;

    const DEFAULT_LIMIT: number = 50;
    let limit: number = reqQuery.limit ? +reqQuery.limit : DEFAULT_LIMIT;
    limit = (limit > DEFAULT_LIMIT) ? DEFAULT_LIMIT : limit;
    reqQuery.limit = undefined;

    let select: string = reqQuery.select ? reqQuery.select : "";
    reqQuery.select = undefined;

    let populate: string = reqQuery.populate ? reqQuery.populate : "";
    reqQuery.populate = undefined;

    let populateSelect: string = reqQuery.populateSelect ? reqQuery.populateSelect : "";
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
      $and: [] as any[]
    }

    for (let searchTerm of searchTerms) {
      searchTerm = EscapeStringRegexp(searchTerm);
      searchQuery.$and.push({
        $or: [
          {
            username: {
              $regex: `\\b${searchTerm}`,
              $options: "i"
            }
          },
          {
            firstName: {
              $regex: `\\b${searchTerm}`,
              $options: "i"
            }
          },
          {
            secondName: {
              $regex: `\\b${searchTerm}`,
              $options: "i"
            }
          }
        ]
      } as any);
    }

    // Change findQuery if query contains "search"
    if (search && search !== "") {
      findQuery = {
        $and: [
          findQuery,
          searchQuery
        ]
      }
    }

    // Execute
    const paginationOptions = {
      populate: { path: populate, select: populateSelect },
      select: select,
      sort: sort,
      collation: { locale: "en" },
      limit: limit,
      page: page
    };

    User.paginate(findQuery, paginationOptions).then((usersPage) => {
      return res.status(200).json(usersPage)
    }).catch((err: Error) => {
      return next(err);
    });
  }


  // Get user with given ID 
  public getUser(req: Request, res: Response, next: NextFunction) {
    const id: string = req.params.id;

    User.findById(id)
      .exec()
      .then((user: IUser | null) => {
        if (!user) {
          return next(Boom.notFound(`User with ID ${id} does not exist`));
        }

        return res.status(200).json(user);
      })
      .catch(err => {
        return next(err);
      });
  }


  // Get the users (:id) favorite Journals
  public async getFavoriteJournals(req: Request, res: Response, next: NextFunction) {
    const id: string = req.params.id;
    const user: IUser | null = await User.findById(id).exec().catch((err: Error) => {
      return next(Boom.notFound(`User with ID ${id} does not exist`));
    });
    if (!user) {
      return next(Boom.notFound(`User with ID ${id} does not exist`));
    }

    // Convert parsed query back to string
    let query: string = ""
    for (let key in req.query) {
      query += `${key}=${req.query[key]}&`
    }
    Logger.debug(query);

    // Build query for favorite journals
    let idsString: string = "";
    for (let favoriteJournalId of user.favoriteJournals) {
      idsString += `_id[]=${favoriteJournalId}&`
    }

    // Prevent wrong results if there are no favorite journals
    idsString = (idsString === "") ? "_id=!" : idsString;

    const favoriteJournalsPage: any = await Axios.get(`${UserConfig.API_URI}/v1/journals?${query}${idsString}`).catch((err: Error) => {
      return next(Boom.notFound(`Cannot get favorite journals of user ${id}`));
    });

    return res.status(200).json(favoriteJournalsPage.data);
  }


  // Add a journal with given ID (:journalId) to the users (:id) favorites
  public async addFavoriteJournal(req: Request, res: Response, next: NextFunction) {
    const userId: string = req.params.id;
    const journalId: string = req.params.journalId;

    // Find journal in database
    const journalToAdd: IJournal | null = await Journal.findById(journalId)
      .exec()
      .catch(err => {
        return next(err);
      });

    if (!journalToAdd) {
      return next(Boom.notFound(`Journal with ID ${journalId} does not exist`));
    }

    const update = { $addToSet: { favoriteJournals: journalToAdd } };

    User.findByIdAndUpdate(userId, update)
      .exec()
      .then((user: IUser | null) => {
        if (!user) {
          return next(Boom.notFound(`User with ID ${userId} does not exist`));
        }

        return res.status(200).json(user);
      })
      .catch(err => {
        Logger.error(err);
        return next(err);
      });
  }


  // Remove the journal with given ID (:journalId) from the Users (:id) favorites
  public removeFavoriteJournal(req: Request, res: Response, next: NextFunction) {
    const userId: string = req.params.id;
    const journalId: string = req.params.journalId;

    const update = { $pull: { favoriteJournals: journalId } };

    User.findByIdAndUpdate(userId, update)
      .exec()
      .then((user: IUser | null) => {
        if (!user) {
          return next(Boom.notFound(`User with id ${userId} does not exist`));
        }

        return res.status(200).json(user);
      })
      .catch(err => {
        Logger.error(err);
        return next(err);
      });
  }


  // Get the users (:id) reading list
  public async getReadingList(req: Request, res: Response, next: NextFunction) {
    const id: string = req.params.id;
    const user: IUser | null = await User.findById(id).exec().catch((err: Error) => {
      return next(Boom.notFound(`User with ID ${id} does not exist`));
    });
    if (!user) {
      return next(Boom.notFound(`User with ID ${id} does not exist`));
    }

    // Convert parsed query back to string
    let query: string = ""
    for (let key in req.query) {
      query += `${key}=${req.query[key]}&`
    }
    Logger.debug(query);

    // Build query for reading list articles
    let idsString: string = "";
    for (let readingListArticleId of user.readingList) {
      idsString += `_id[]=${readingListArticleId}&`
    }

    // Prevent wrong results if there are no reading list articles
    idsString = (idsString === "") ? "_id=!" : idsString;

    const readingListPage: any = await Axios.get(`${UserConfig.API_URI}/v1/articles?${query}${idsString}`).catch((err: Error) => {
      return next(Boom.notFound(`Cannot get reading list of user ${id}`));
    });

    return res.status(200).json(readingListPage.data);
  }


  // Add an article by id (:articleId) to the users (:id) reading list
  public async addArticleToReadingList(req: Request, res: Response, next: NextFunction) {
    const userId: string = req.params.id;
    const articleId: string = req.params.articleId;

    // Find article in database
    const articleToAdd: IArticle | null = await Article.findById(articleId)
      .exec()
      .catch(err => {
        return next(err);
      });

    if (!articleToAdd) {
      return next(Boom.notFound(`Article with ID ${articleId} does not exist`));
    }

    const update = { $addToSet: { readingList: articleToAdd } };

    User.findByIdAndUpdate(userId, update)
      .exec()
      .then((user: IUser | null) => {
        if (!user) {
          return next(Boom.notFound(`User with ID ${userId} does not exist`));
        }

        return res.status(200).json(user);
      })
      .catch(err => {
        Logger.error(err);
        return next(err);
      });
  }


  // Remove an article with given ID (:articleId) from the users (:id) reading list
  public removeArticleFromReadingList(req: Request, res: Response, next: NextFunction) {
    const userId: string = req.params.id;
    const articleId: string = req.params.articleId;

    const update = { $pull: { readingList: articleId } };

    User.findByIdAndUpdate(userId, update)
      .exec()
      .then((user: IUser | null) => {
        if (!user) {
          return next(Boom.notFound(`User with ID ${userId} does not exist`));
        }

        return res.status(200).json(user);
      })
      .catch(err => {
        Logger.error(err);
        return next(err);
      });
  }


  // Update the user with given ID
  public async patchUser(req: Request, res: Response, next: NextFunction) {
    const userId: string = req.params.id;
    const update = req.body;

    if (update.accessLevel && update.accessLevel !== "admin") {
      const numberOfAdminUsers: number = await User.find({ accessLevel: "admin" })
        .count()
        .exec();

      if (numberOfAdminUsers < 2) {
        return next(Boom.illegal("Cannot remove admin privileges from the only admin user"));
      }
    }

    User.findByIdAndUpdate(userId, update)
      .exec()
      .then((user: IUser | null) => {
        if (!user) {
          return next(Boom.notFound(`User with ID ${userId} does not exist`));
        }

        return res.status(200).json(user);
      })
      .catch(err => {
        Logger.error(err);
        return next(err);
      });
  }

}


export default new UserController();
