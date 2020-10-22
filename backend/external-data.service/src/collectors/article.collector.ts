import Axios, { AxiosResponse } from "axios";
import { IArticle, IJournal } from "../shared/interfaces";
import { Article, Journal } from "../shared/models";
import { Logger } from "../shared";
import { sanitizeArticle } from "../sanitizer";

class ArticleCollector {
  // Search articles (using pagination) and save to the database.
  // Returns the total length of search results.
  private async searchAndAddArticlesPaginated(
    journalId: string,
    journalIdentifier: string,
    pageSize: number,
    page: number
  ): Promise<number> {
    let promise: Promise<number> = new Promise(async (resolve, reject) => {
      // Get data from DOAJ
      const query: string = `https://doaj.org/api/v1/search/articles/issn:${journalIdentifier}?sort=created_date:desc&page=${page}&pageSize=${pageSize}`;
      const response: AxiosResponse = await Axios.get(query).catch((err) => {
        return reject(err);
      });

      if (!response) {
        return reject(new Error(`searchAndAddArticlesPaginated: no response`));
      }

      const data: any = response.data;
      if (!data) {
        return reject(new Error(`searchAndAddArticlesPaginated: no data`));
      }

      const results: any = data.results;
      if (!results) {
        return reject(new Error(`searchAndAddArticlesPaginated: no results`));
      }

      // Convert results to our format
      for (let result of results) {
        let bibjson;
        try {
          bibjson = result.bibjson;

          // Build resulting journal.
          let article: IArticle = {} as IArticle;
          article.title = bibjson.title;
          article.abstract = bibjson.abstract;
          article.pubdate = result.created_date;
          article.publishedIn = journalId;

          // Authors.
          article.authors = [];
          for (let resultAuthor of bibjson.author) {
            article.authors.push(resultAuthor.name);
          }

          // DOI
          for (let resultIdentifier of bibjson.identifier) {
            if (resultIdentifier.type === "doi") {
              article.doi = resultIdentifier.id;
            }
          }

          // Sanitize article
          article = sanitizeArticle(article);

          // Push article to result array
          article = new Article(article);
          await article.save();
        } catch (err) {
          // Continue with next result
        }
      }

      const totalSize: number = response.data.total;
      if (isNaN(totalSize)) {
        return reject(new Error(`totalSize does not exist`));
      }
      return resolve(totalSize);
    });
    return promise;
  }

  // Keep searching and adding articles with "searchAndAddArticlesPaginated()" until there are no more results
  public async searchAndAddArticles(journalId: string): Promise<void> {
    let promise: Promise<void> = new Promise(async (resolve, reject) => {
      let journal: IJournal | null = await Journal.findById(journalId)
        .exec()
        .catch((err) => {
          return reject(err);
        });

      if (!journal) {
        return reject(new Error(`Journal with ID ${journalId} doesn't exist`));
      }

      await journal.update({ updated: new Date() });

      const identifier: string = journal.identifier;

      const pageSize: number = 10;
      let currentPage: number = 1;
      let receivedArticles: number = pageSize * currentPage;

      const totalSize: number = await this.searchAndAddArticlesPaginated(
        journalId,
        identifier,
        pageSize,
        currentPage
      ).catch((err) => {
        return reject(err);
      });

      Logger.debug(totalSize);

      while (receivedArticles < totalSize) {
        currentPage++;
        await this.searchAndAddArticlesPaginated(
          journalId,
          identifier,
          pageSize,
          currentPage
        ).catch((err) => {
          return reject(err);
        });
        receivedArticles += pageSize;
      }

      return resolve();
    });

    return promise;
  }
}

export default new ArticleCollector();
