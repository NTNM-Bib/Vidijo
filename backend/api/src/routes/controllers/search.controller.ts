import ApiConfig from "../../api.config";
import { Request, Response, NextFunction } from "express";
import Axios from "axios";

class SearchController {
  // Search journals in 3rd party services
  public async searchJournals(req: Request, res: Response, next: NextFunction) {
    const searchTerm: string = req.query.term as string;

    console.log(searchTerm);
    console.log(ApiConfig.EXTERNAL_DATA_SERVICE_URI);

    Axios.get(
      `${ApiConfig.EXTERNAL_DATA_SERVICE_URI}/v1/search/journals?term=${searchTerm}`
    )
      .then((response) => {
        return res.status(200).json(response.data);
      })
      .catch((err: Error) => {
        return next(err);
      });
  }
}

export default new SearchController();
