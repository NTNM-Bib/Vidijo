import ApiConfig from "../../api.config";
import { Request, Response, NextFunction } from "express";
import Axios from "axios";

class ImporterController {
  // Import a .xlsx spreadsheet file
  public async importXLSX(req: Request, res: Response, next: NextFunction) {
    const body = req.body;

    Axios.post(`${ApiConfig.IMPORTER_SERVICE_URI}/`, body).catch(
      (err: Error) => {
        return next(err);
      }
    );

    return res.status(200).json({});
  }
}

export default new ImporterController();
