import Axios, { AxiosResponse } from 'axios'
import { IJournal } from '../shared/interfaces'
import CreateError from 'http-errors'

class JournalCollector {
  /**
   * Search journals in the DOAJ API
   * Return a journal containing title, issn and eissn
   *
   * @param term
   */
  public searchJournals(term: string): Promise<IJournal[]> {
    return (
      Axios.get(`https://doaj.org/api/v2/search/journals/${term}`)
        // Check DOAJ response
        .then((response: AxiosResponse<any>) => {
          if (!response) throw CreateError(404, `Axios did not get a response`)
          if (!response.data)
            throw CreateError(404, `Axios response does not contain data`)
          if (!response.data.results)
            throw CreateError(
              404,
              `Axios response.data does not contain results`
            )

          return response.data.results
        })
        // Convert from DOAJ to Vidijo format
        .then((doajJournals: any[]) =>
          doajJournals.reduce((acc, j) => {
            const journal = {
              title: j.bibjson.title,
              issn: j.bibjson.pissn,
              eissn: j.bibjson.eissn,
            } as IJournal

            return [...acc, journal] as IJournal[]
          }, [] as IJournal[])
        )
    )
  }
}

export default new JournalCollector()
