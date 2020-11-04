import Axios, { AxiosResponse } from "axios";
import { IArticle, IJournal } from "../shared/interfaces";
import { Article, Journal } from "../shared/models";
import { sanitizeArticle } from "../sanitizer";
import { Logger } from "../shared";
import { DOAJArticle, DOAJResponse } from "./doaj.interface";

/**
 * Retrieve articles from the DOAJ API and add them to the given journal
 * Concurrently calls searchAndAddArticlesPaginated() for each API result page
 *
 * @param journalId The journal to search and add articles for
 */
// FIXME: DOAJ returns 429 (too many requests)
export const searchAndAddArticles = (journalId: string) => {
  return new Promise(async (resolve, reject) => {
    try {
      // Get journal identifier
      const journal: IJournal | null = await Journal.findById(journalId).exec();
      if (!journal)
        throw new Error(`Cannot find the journal with ID ${journalId}`);

      // Set new updated date
      journal.updated = new Date();
      await journal.save();

      // Query the first page to get total number of articles
      const pageSize = 100; // 100 is the max number of DOAJ
      const firstPageAddedResult = await searchAndAddArticlesPaginated(
        journalId,
        journal.identifier,
        pageSize,
        1
      );

      // Create a promise for each page
      let promises: Promise<{ total: number; added: number }>[] = [];
      for (let i = 2; i * pageSize < firstPageAddedResult.total; ++i) {
        const promise = searchAndAddArticlesPaginated(
          journalId,
          journal.identifier,
          pageSize,
          i
        );

        promises = [...promises, promise];
      }

      // Promise.all() for all possible pages (excluding the first one)
      Promise.allSettled(promises)
        .then((results) => {
          const numberOfAddedArticles = results.reduce(
            (acc, settledPromise) => {
              return acc + (settledPromise.status === "fulfilled" ? 1 : 0);
            },
            0
          );
          Logger.log(
            `Added ${numberOfAddedArticles} articles to ${journal.title}`
          );
          return resolve({ added: numberOfAddedArticles });
        })
        .catch();
    } catch (err) {
      return reject(err);
    }
  });
};

/**
 * Search and add articles of the given journal.
 * Only add articles of the specified results page of the DOAJ API.
 * @param journalId
 * @param journalIdentifier
 * @param pageSize
 * @param page
 */
const searchAndAddArticlesPaginated = (
  journalId: string,
  journalIdentifier: string,
  pageSize: number = 100,
  page: number = 1
): Promise<{ total: number; added: number }> => {
  return new Promise(async (resolve, reject) => {
    try {
      const query: string = `https://doaj.org/api/v1/search/articles/issn:${journalIdentifier}?sort=created_date:desc&page=${page}&pageSize=${pageSize}`;
      const response: AxiosResponse<DOAJResponse> = await Axios.get(query);
      const doajJournals: DOAJArticle[] = response.data.results;

      const articles: IArticle[] = doajJournals.map((doajArticle) => {
        const article = {
          doi:
            doajArticle.bibjson.identifier.find((value) => value.type === "doi")
              ?.id || "",
          publishedIn: journalId,
          title: doajArticle.bibjson.title,
          authors: doajArticle.bibjson.author.map((v) => v.name),
          abstract: doajArticle.bibjson.abstract,
          pubdate: new Date(doajArticle.created_date),
        } as IArticle;

        return sanitizeArticle(article);
      });

      const promises = articles.map((article) => {
        return new Article(article).save();
      });

      Promise.allSettled(promises).then((results) => {
        const numAddedArticles = results.reduce(
          (acc, v) => acc + (v.status === "fulfilled" ? 1 : 0),
          0
        );
        return resolve({
          total: response.data.total as number,
          added: numAddedArticles,
        });
      });
    } catch (err) {
      return reject(err);
    }
  });
};
