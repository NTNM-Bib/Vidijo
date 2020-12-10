import Axios, { AxiosResponse } from 'axios'
import CreateError from 'http-errors'
import { IJournal } from 'vidijo-lib/lib/interfaces'
import { Journal } from 'vidijo-lib/lib/models'

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

  /**
   * Returns an object with search results for the given search term
   * The results are separated in already installed journals and available journals
   *
   * @param term
   */
  public getAvailableAndAlreadyInstalledJournals(term: string) {
    return this.searchJournals(term)
      .then(async (journals) => {
        const issnArray = journals.reduce(
          (acc, j) => (j.issn ? [...acc, j.issn] : acc),
          [] as string[]
        )
        const eissnArray = journals.reduce(
          (acc, j) => (j.eissn ? [...acc, j.eissn] : acc),
          [] as string[]
        )
        const condition = {
          $or: [{ issn: { $in: issnArray } }, { eissn: { $in: eissnArray } }],
        }

        const alreadyExistingJournals: IJournal[] = await Journal.find(
          condition
        )
          .select('title issn eissn')
          .exec()

        const availableJournals: IJournal[] = journals.filter((j) => {
          const res = alreadyExistingJournals.find(
            (journalToFind) =>
              (journalToFind.issn && journalToFind.issn === j.issn) ||
              (journalToFind.eissn && journalToFind.eissn === j.eissn)
          )

          return !res
        })

        const searchResults = {
          alreadyExistingJournals: alreadyExistingJournals,
          availableJournals: availableJournals,
        }

        return searchResults
      })
      .catch((err) => {
        throw new Error(`Cannot search for journals: ${err}`)
      })
  }
}

export default new JournalCollector()
