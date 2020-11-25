import { IJournal } from './journal.interface'
import { ICategory } from './category.interface'

export interface VidijoData {
  journals: IJournal[]
  categories: ICategory[]
}

export interface VidijoDataInfo {
  journalsInDatabase: number
  journalsOnList: number
  journalsToAdd: number

  categoriesInDatabase: number
  categoriesOnList: number
  categoriesToAdd: number
}
