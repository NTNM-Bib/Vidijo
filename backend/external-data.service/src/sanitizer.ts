import { IArticle } from 'vidijo-lib/lib/interfaces'
import HtmlToText from 'html-to-text'
import _ from 'lodash'

export const sanitizeArticle = (article: IArticle): IArticle => {
  article.title = sanitizeTitle(article)
  article.authors = sanitizeAuthors(article)
  article.abstract = sanitizeAbstract(article)
  return article
}

function sanitizeTitle(article: IArticle): string {
  return HtmlToText.fromString(article.title, {
    wordwrap: false,
    ignoreImage: true,
  })
}

const sanitizeAuthors = (article: IArticle): string[] => {
  if (!article.authors || !article.authors.length) return []

  return _.uniq(article.authors)
}

const sanitizeAbstract = (article: IArticle): string => {
  return HtmlToText.fromString(article.abstract, {
    wordwrap: false,
    ignoreImage: true,
  })
}
