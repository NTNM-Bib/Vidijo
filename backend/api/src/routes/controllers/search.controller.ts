import ApiConfig from '../../api.config'
import { Request, Response, NextFunction } from 'express'
import Axios from 'axios'

class SearchController {
  // Search journals in 3rd party services
  public searchJournals(req: Request, res: Response, next: NextFunction) {
    const searchTerm: string = req.query.term as string

    Axios.get(
      `${ApiConfig.EXTERNAL_DATA_SERVICE_URI}/v1/search/journals-partitioned?term=${searchTerm}`
    )
      .then((response) => res.json(response.data))
      .catch(next)
  }
}

export default new SearchController()
