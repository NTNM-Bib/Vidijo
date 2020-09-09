import { Request, Response, NextFunction } from "express";
import EscapeStringRegexp from "escape-string-regexp";
import { IArticle, IJournal } from "../../shared/interfaces";
import { Article, Journal } from "../../shared/models";
import Logger from "../../shared/logger";


const MongoQueryString = require("mongo-querystring");
const MongoQS = new MongoQueryString({
  custom: {
    after: "pubdate",
    before: "pubdate",
    between: "pubdate"
  }
});

class ArticleController {


}
export default new ArticleController();
