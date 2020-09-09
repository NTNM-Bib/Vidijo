import { Request, Response, NextFunction } from "express";
import Boom from "@hapi/boom";
import EscapeStringRegexp from "escape-string-regexp";
import { Category } from "../../shared/models";
import { ICategory } from "../../shared/interfaces";
import Logger from "../../shared/logger";

const MongoQueryString = require("mongo-querystring");
const MongoQS = new MongoQueryString();


class CategoryController {

  // GET /categories
  public async getCategories(req: Request, res: Response, next: NextFunction) {
    let reqQuery: any = req.query;

    // Remove sorting, limit and selection from find query
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
        title: {
          $regex: `\\b${searchTerm}`,
          $options: "i"
        }
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

    Category.paginate(findQuery, paginationOptions).then((categoriesPage: any) => {
      return res.status(200).json(categoriesPage)
    }).catch((err: Error) => {
      return next(err);
    });
  }


  // GET /category/:id
  public getCategory(req: Request, res: Response, next: NextFunction) {
    const id: string = req.params.id;

    Category.findOne({ _id: id })
      .exec()
      .then((category: ICategory | null) => {
        if (!category) {
          return next(Boom.notFound(`Category ${id} does not exist`));
        }
        return res.status(200).json(category);
      })
      .catch(err => {
        return next(err);
      });
  }


  // POST /category
  public async createCategory(req: Request, res: Response, next: NextFunction) {
    const body = req.body;
    const category: ICategory = new Category(body);

    category.save().then((savedCategory: ICategory) => {
      return res.status(200).json(savedCategory);
    }).catch((err) => {
      Logger.error(err);
      return next(err);
    });
  }


  // PUT /category
  public async patchCategory(req: Request, res: Response, next: NextFunction) {
    const id: string = req.params.id;
    const update = req.body;

    Category.findByIdAndUpdate(id, update)
      .exec()
      .then((patchedCategory: ICategory | null) => {
        if (!patchedCategory) {
          return next(Boom.notFound(`Category ${id} does not exist`));
        }
        return res.status(200).json(patchedCategory);
      })
      .catch(err => {
        return next(err);
      });
  }


  // DELETE /category
  // TODO: Remove category ID from all journals that are tagged with this category
  public async deleteCategory(req: Request, res: Response, next: NextFunction) {
    const id: string = req.params.id;

    Category.deleteOne({ _id: id })
      .exec()
      .then(result => {
        return res.status(200).json(result);
      })
      .catch(err => {
        return next(err);
      });
  }
}


export default new CategoryController();
