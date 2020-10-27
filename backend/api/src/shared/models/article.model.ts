import Mongoose from "mongoose";
import { Schema } from "mongoose";

import MongoosePaginate from "mongoose-paginate-v2";

import { IArticle, IArticleModel } from "../interfaces/article.interface";
import { IJournal } from "../interfaces";
import { Journal } from "./journal.model";

export var articleSchema: Schema = new Schema(
  {
    publishedIn: {
      type: Schema.Types.ObjectId,
      ref: "Journal",
    },

    doi: {
      type: String,
      required: true,
    },

    title: {
      type: String,
      default: "",
    },

    authors: {
      type: [String],
      default: [],
    },

    abstract: {
      type: String,
      default: "",
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
);

articleSchema.virtual("source").get(function (this: IArticle) {
  return `https://doi.org/${this.doi}`;
});

// Let validation fail if article with same DOI already exists
articleSchema.pre<IArticle>("validate", async function (next) {
  const articlesWithSameDOI: IArticle[] = await Article.find({ doi: this.doi })
    .exec()
    .catch((err) => {
      throw err;
    });

  if (articlesWithSameDOI.length > 0) {
    return next(new Error(`Article with DOI ${this.doi} already exists`));
  }

  return next();
});

// Set "latestPubdate" in the article's journal
articleSchema.pre<IArticle>("save", async function () {
  // Check if journal exists where the article was published in
  const pubdate: Date = this.pubdate;

  const journal: IJournal | null = await Journal.findOne({
    _id: this.publishedIn,
  })
    .exec()
    .catch((err) => {
      throw err;
    });

  if (!journal) {
    throw new Error(
      `ArticleSchema pre save: Journal with ID ${this.publishedIn} doesn't exist`
    );
  }

  // Update "latestPubdate" in journal
  if (
    !journal.latestPubdate ||
    journal.latestPubdate.getTime() < pubdate.getTime()
  ) {
    journal
      .update({ latestPubdate: pubdate })
      .exec()
      .catch((err) => {
        throw err;
      });
  }
});

// Pagination Plugin
articleSchema.plugin(MongoosePaginate);

export const Article = Mongoose.model<IArticle, IArticleModel>(
  "Article",
  articleSchema
);
