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
export const searchAndAddArticles = (journalId: string) => {
  const pageSize = 100;
  const wait = (delay: number) =>
    new Promise((resolve) => setTimeout(resolve, delay));

  return (
    Journal.findById(journalId)
      .exec()
      .then((journal) => {
        if (!journal)
          throw new Error(`Cannot find the journal with ID ${journalId}`);

        return journal;
      })
      .catch((err) => {
        throw new Error(
          `Something went wrong when trying to find the journal with ID ${journalId}: ${err}`
        );
      })
      // Get first results page
      .then((journal) => {
        return searchAndAddArticlesPaginated(
          journalId,
          journal.identifier,
          pageSize,
          1
        )
          .then((firstPage) => ({ firstPage: firstPage, journal: journal }))
          .catch((err) => {
            throw err;
          });
      })
      // Update journal metadata
      .then((v) => {
        const journal = v.journal;
        journal.updated = new Date();
        journal.latestPubdate = v.firstPage.latestPubdate || undefined;

        return journal
          .save()
          .then((savedJournal) => ({ ...v, journal: savedJournal }))
          .catch((err) => {
            throw new Error(`Cannot save journal ${journal} ${err}`);
          });
      })
      // Get remaining pages async
      .then((v) => {
        let promises: Promise<{ total: number; added: number }>[] = [];
        for (let i = 2; i * pageSize < v.firstPage.total; ++i) {
          const delay = i * 500;
          const promise = wait(delay)
            .then(() => {
              Logger.log(`Getting page ${i}`);
            })
            .then(() =>
              searchAndAddArticlesPaginated(
                journalId,
                v.journal.identifier,
                pageSize,
                i
              )
            );

          promises = [...promises, promise];
        }

        return Promise.allSettled(promises).then((results) => {
          const added = results.reduce((acc, settledPromise) => {
            return acc + (settledPromise.status === "fulfilled" ? 1 : 0);
          }, 0);

          return { added: added, journal: v.journal };
        });
      })
      .then((v) => {
        Logger.log(`Added ${v.added} pages of articles to ${v.journal.title}`);
        return v;
      })
      .catch((err) => {
        throw (
          (err as Error) ||
          new Error("Something went wrong in searchAndAddArticles")
        );
      })
  );
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
): Promise<{ total: number; added: number; latestPubdate: Date }> => {
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
          latestPubdate: new Date(response.data.results[0].created_date),
        });
      });
    } catch (err) {
      return reject(err);
    }
  });
};
