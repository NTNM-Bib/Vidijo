import { Request, Response, NextFunction } from "express";

class V1Controller {
  // About v1
  public about(req: Request, res: Response, next: NextFunction) {
    return res.status(200).json({
      info: "Vidijo API v1",
    });
  }
}

export default new V1Controller();
