import Axios, { AxiosResponse } from 'axios'
import { IArticle, IJournal } from 'vidijo-lib/lib/interfaces'
import { Article, Journal } from 'vidijo-lib/lib/models'
import { sanitizeArticle } from '../sanitizer'
import { Logger } from 'vidijo-lib'
import { DOAJResponse } from './doaj.interface'

/**
 * Retrieve articles from the DOAJ API and add them to the given journal
 * Concurrently calls searchAndAddArticlesPaginated() for each API result page
 *
 * @param journalId The journal to search and add articles for
 */
export const searchAndAddArticles = (journalId: string) => {
  const pageSize = 100

  const wait = (delay: number) =>
    new Promise((resolve) => setTimeout(resolve, delay))

  return (
    Journal.findById(journalId)
      .exec()
      .then((journal: IJournal) => {
        if (!journal)
          throw new Error(`Cannot find the journal with ID ${journalId}`)

        return journal
      })
      .catch((err: any) => {
        throw new Error(
          `Something went wrong when trying to find the journal with ID ${journalId}: ${err}`
        )
      })
      // Get first results page
      .then((journal: IJournal) => {
        return searchAndAddArticlesPaginated(
          journalId,
          journal.identifier,
          pageSize,
          1
        )
          .then((firstPage) => ({ firstPage: firstPage, journal: journal }))
          .catch((err) => {
            throw err
          })
      })
      // Update journal metadata
      .then((v: any) => {
        const journal = v.journal
        journal.updated = new Date()
        journal.latestPubdate = v.firstPage.latestPubdate || undefined

        return journal
          .save()
          .then((savedJournal: IJournal) => ({ ...v, journal: savedJournal }))
          .catch((err: any) => {
            throw new Error(`Cannot save journal ${journal} ${err}`)
          })
      })
      // Get remaining pages async
      .then((v: any) => {
        let promises: Promise<{ total: number; added: number }>[] = []
        for (let i = 2; i * pageSize < v.firstPage.total; ++i) {
          const delay = i * 500
          const promise = wait(delay)
            .then(() => {
              Logger.log(`Getting page ${i}`)
            })
            .then(() =>
              searchAndAddArticlesPaginated(
                journalId,
                v.journal.identifier,
                pageSize,
                i
              )
            )

          promises = [...promises, promise]
        }

        return Promise.allSettled(promises).then((results) => {
          const added = results.reduce((acc, settledPromise) => {
            return acc + (settledPromise.status === 'fulfilled' ? 1 : 0)
          }, 0)

          return { added: added, journal: v.journal }
        })
      })
      .then((v: any) => {
        Logger.log(
          `Added ${v.added} pages containing up to ${pageSize} articles to ${v.journal.title}`
        )
        return v
      })
      .catch((err: any) => {
        throw (
          (err as Error) ||
          new Error('Something went wrong in searchAndAddArticles')
        )
      })
  )
}

/**
 * Search and add articles of the given journal.
 * Only add articles of the specified results page of the DOAJ API.
 * @param journalId
 * @param journalIdentifier
 * @param pageSize
 * @param page
 */
export const searchAndAddArticlesPaginated = (
  journalId: string,
  journalIdentifier: string,
  pageSize: number = 100,
  page: number = 1
) => {
  const query: string = `https://doaj.org/api/v2/search/articles/issn:${journalIdentifier}?sort=created_date:desc&page=${page}&pageSize=${pageSize}`

  return (
    Axios.get(query)
      // Get articles from DOAJ
      .then((response: AxiosResponse<DOAJResponse>) => ({
        doajArticles: response.data.results,
        total: response.data.total,
      }))
      // Transform DOAJ articles to Vidijo articles
      .then((v) => {
        const articles = v.doajArticles.map((doajArticle) => {
          const article = {
            doi:
              doajArticle.bibjson.identifier.find((v) => v.type === 'doi')
                ?.id || undefined,
            publishedIn: journalId,
            title: doajArticle.bibjson.title || undefined,
            authors: doajArticle.bibjson.author.map((v) => v.name) || undefined,
            abstract: doajArticle.bibjson.abstract || undefined,
            pubdate: new Date(doajArticle.created_date) || undefined,
          } as IArticle

          return article
        })
        return { articles: articles, total: v.total }
      })
      // Sanitize articles, reject failed sanitization attempts
      .then((v) =>
        Promise.allSettled(
          v.articles.map((article) => sanitizeArticle(article))
        )
          .then((results) => {
            const sanitizedArticles = results.reduce(
              (acc, v) => (v.status === 'fulfilled' ? [...acc, v.value] : acc),
              [] as IArticle[]
            )

            return { articles: sanitizedArticles, total: v.total }
          })
          .catch((err) => {
            throw new Error(
              `Promise.allSettled threw an unexpected error: ${err}`
            )
          })
      )
      // Save sanitized articles to the database
      .then((v) =>
        Promise.allSettled(
          v.articles.map((article) => new Article(article).save())
        )
          .then((result) => ({
            total: v.total,
            added: result.reduce(
              (acc, v) => (acc + v.status === 'fulfilled' ? 1 : 0),
              0
            ),
            latestPubdate:
              v.articles.sort(
                (a, b) => b.pubdate.getTime() - a.pubdate.getTime()
              )[0]?.pubdate || null,
          }))
          .catch((err) => {
            throw new Error(
              `Unexpected error when trying to save articles: ${err}`
            )
          })
      )
      .catch((err) => {
        throw (
          (err as Error) ||
          new Error(
            `Something went wrong in searchAndAddArticlesPaginated(): ${err}`
          )
        )
      })
  )
}
