import ApiConfig from "../../api.config";
import { Request, Response, NextFunction } from "express";
import Axios, { AxiosRequestConfig } from "axios";

class ImporterController {
  // Import a .xlsx spreadsheet file
  public async importXLSX(req: Request, res: Response, next: NextFunction) {
    const body = req.body;

    console.table(body);

    const config: AxiosRequestConfig = {} as AxiosRequestConfig;

    const response = await Axios.post(
      `${ApiConfig.IMPORTER_SERVICE_URI}/`,
      body,
      config
    ).catch((err: Error) => {
      return next(err);
    });

    return res.status(200).json(response);
  }
}

export default new ImporterController();
