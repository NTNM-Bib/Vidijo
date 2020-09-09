import ApiConfig from "../../api.config";
import { Request, Response, NextFunction } from "express";
import { IJournal } from "../../shared/interfaces";
import Boom from "@hapi/boom";
import Axios from "axios";


class SearchController {

  // Search journals in 3rd party services
  public async searchJournals(req: Request, res: Response, next: NextFunction) {
    const searchTerm: string = req.query.term;

    console.log(searchTerm);
    console.log(ApiConfig.EXTERNAL_DATA_SERVICE_URI);

    const response = await Axios.get(`${ApiConfig.EXTERNAL_DATA_SERVICE_URI}/v1/search/journals?term=${searchTerm}`)
      .catch((err: Error) => {
        return next(err);
      });

    return res.status(200).json(response.data);
  }
}


export default new SearchController();
