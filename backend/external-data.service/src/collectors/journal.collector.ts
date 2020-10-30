import Axios, { AxiosResponse } from "axios";
import { IJournal } from "../shared/interfaces";

class JournalCollector {
  // Search journals by search term
  public async searchJournals(searchTerm: string): Promise<IJournal[]> {
    const promise: Promise<IJournal[]> = new Promise(
      async (resolve, reject) => {
        const result: AxiosResponse = await Axios.get(
          `https://doaj.org/api/v1/search/journals/${searchTerm}`
        );

        if (!result) {
          return reject(new Error("Cannot get journals from DOAJ API"));
        }

        const resultData = result.data;

        // Get result array
        let doajJournals;
        try {
          doajJournals = resultData.results;
        } catch (err) {
          return resolve([]);
        }

        let journals: IJournal[] = [];
        for (let doajJournal of doajJournals) {
          let bibjson;
          try {
            bibjson = doajJournal.bibjson;
            let identifiers = bibjson.identifier;

            // Build resulting journal.
            let journal: IJournal = {} as IJournal;
            journal.title = bibjson.title;

            for (let identifier of identifiers) {
              if (identifier.type === "eissn") {
                journal.eissn = identifier.id;
              } else if (identifier.type === "pissn") {
                journal.issn = identifier.id;
              }
            }

            // Push journal to result array.
            journals.push(journal);
          } catch (err) {
            // Continue with next result
          }
        }

        return resolve(journals);
      }
    );

    return promise;
  }
}

export default new JournalCollector();
