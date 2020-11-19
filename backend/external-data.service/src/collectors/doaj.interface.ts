export interface DOAJResponse {
  total: number
  page: number
  pageSize: number
  timestamp: string
  query: string
  results: DOAJArticle[]
  next: string
  last: string
  sort: string
}

export interface DOAJArticle {
  last_updated: string
  bibjson: Bibjson
  admin: Admin
  id: string
  created_date: string
}

interface Admin {
  seal: boolean
}

interface Bibjson {
  identifier: Identifier[]
  journal: Journal
  month: string
  end_page: string
  year: string
  start_page: string
  subject: Subject[]
  author: Author[]
  link: Link[]
  abstract: string
  title: string
}

interface Link {
  content_type: string
  type: string
  url: string
}

interface Author {
  affiliation: string
  name: string
}

interface Subject {
  code: string
  scheme: string
  term: string
}

interface Journal {
  volume: string
  country: string
  license: License[]
  issns: string[]
  publisher: string
  language: string[]
  title: string
}

interface License {
  open_access: boolean
  title: string
  type: string
  url: string
}

interface Identifier {
  id: string
  type: string
}
