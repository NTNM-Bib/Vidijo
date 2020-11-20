import Mongoose, { Schema } from 'mongoose'
import MongoosePaginate from 'mongoose-paginate-v2'
import { IArticle, IArticleModel } from '../interfaces/article.interface'

export const articleSchema: Schema = new Schema(
  {
    publishedIn: {
      type: Schema.Types.ObjectId,
      ref: 'Journal',
    },

    doi: {
      type: String,
      required: true,
    },

    title: {
      type: String,
      default: '',
    },

    authors: {
      type: [String],
      default: [],
    },

    abstract: {
      type: String,
      default: '',
    },

    pubdate: {
      type: Date,
      default: undefined,
    },
  },
  // Schema options
  {
    toObject: {
      virtuals: true,
    },
    toJSON: {
      virtuals: true,
    },
    id: false,
  }
)

articleSchema.virtual('source').get(function (this: IArticle) {
  return `https://doi.org/${this.doi}`
})

// Let validation fail if article with same DOI already exists
articleSchema.pre<IArticle>('validate', async function (next) {
  const articlesWithSameDOI: IArticle[] = await Article.find({ doi: this.doi })
    .exec()
    .catch((err) => {
      throw err
    })

  if (articlesWithSameDOI.length > 0) {
    return next(new Error(`Article with DOI ${this.doi} already exists`))
  }

  return next()
})

// Pagination Plugin
articleSchema.plugin(MongoosePaginate)

export const Article = Mongoose.model<IArticle, IArticleModel>(
  'Article',
  articleSchema
)
