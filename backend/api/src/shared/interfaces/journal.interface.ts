import { Document, Model, PaginateModel } from 'mongoose'

interface IJournalDocument extends Document {
  active: boolean
  title: string
  issn: string
  eissn: string
  source: string
  cover: string
  added: Date
  latestPubdate: Date
  views: number
  updated: Date
  categories: any[] // Category[] or array of IDs
  identifier: string // Virtual: returns issn or eissn
}

export interface IJournal extends IJournalDocument {
  incViews(): void
}

export interface IJournalModel
  extends Model<IJournal>,
    PaginateModel<IJournal> {}
