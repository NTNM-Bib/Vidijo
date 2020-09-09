import ExternalDataConfig from "../../external-data.config";
import { Request, Response, NextFunction } from "express";
import { IJournal, IArticle } from "../../shared/interfaces";
import { Journal, Article } from "../../shared/models";
import Boom from "@hapi/boom";
import Axios from "axios";
import Logger from "../../shared/logger";
import { CoverCollector, ArticleCollector } from "../../collectors";


const MongoQueryString = require("mongo-querystring");
const MongoQS = new MongoQueryString({
  custom: {
    after: "added",
    before: "added",
    between: "added"
  }
});


class JournalController {

  // Create a new journal
  // When created, search its cover
  // Also search and add articles
  public addNewJournal(req: Request, res: Response, next: NextFunction) {
    const body = req.body;
    const journal: IJournal = new Journal(body);

    journal
      .save()
      .then(async (savedJournal: IJournal) => {
        await CoverCollector.searchAndAddCover(journal._id).catch(() => { });
        await ArticleCollector.searchAndAddArticles(journal._id).catch(() => { });

        return res.status(201).json(savedJournal);
      })
      .catch(err => {
        return next(err);
      });
  }


  // Add new journals in bulk
  public async bulkAddNewJournals(req: Request, res: Response, next: NextFunction) {
    const body = req.body;
    const journals: IJournal[] = body.map((value: IJournal) => {
      return new Journal(value);
    })

    for (let journal of journals) {
      await journal.save().catch((err: Error) => {
        return next(err);
      });

      await CoverCollector.searchAndAddCover(journal._id).catch(() => { });
      await ArticleCollector.searchAndAddArticles(journal._id).catch(() => { });
    }

    return res.status(200).json(journals);
  }


  // Fetch newest articles of the journal with given ID
  public async fetchNewestArticles(req: Request, res: Response, next: NextFunction) {
    const id = req.params.id;

    await ArticleCollector.searchAndAddArticles(id).catch((err: Error) => {
      return next(err);
    });

    return res.status(200).json({ journalId: id });
  }

}


export default new JournalController();
