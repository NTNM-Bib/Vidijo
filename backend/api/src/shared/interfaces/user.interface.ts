import { Document, Model, PaginateModel } from 'mongoose'
import { IArticle } from '.'

interface IUserDocument extends Document {
  // General
  username: string
  password: string
  firstName: string
  secondName: string

  // Technical
  isVerified: boolean
  passwordResetToken: string
  passwordResetExpires: Date
  accessLevel: 'default' | 'admin'
  lastActivity: Date
  created: Date

  // Content
  favoriteJournals: any[]
  readingList: any[]
}

export interface IUser extends IUserDocument {
  verifyPassword(plaintextPassword: string, callback: any): void
  checkAccessLevel(accessLevelToCheck: 'default' | 'admin', callback: any): void
}

export interface IUserModel extends Model<IUser>, PaginateModel<IUser> {}
