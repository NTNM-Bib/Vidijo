import { Document, Model, PaginateModel } from 'mongoose'

interface ICategoryDocument extends Document {
  title: string
  color: string
  display: boolean // True if displayed on front page
}

export interface ICategory extends ICategoryDocument {}

export interface ICategoryModel
  extends Model<ICategory>,
    PaginateModel<ICategory> {}
