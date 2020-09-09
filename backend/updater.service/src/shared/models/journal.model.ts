import Mongoose, { Schema, HookNextFunction } from "mongoose";
import { IJournal, IJournalModel } from "../interfaces/journal.interface";
import { Article } from "./article.model";

import MongoosePaginate from "mongoose-paginate-v2";


export const journalSchema: Schema = new Schema({
  active: {
    type: Boolean,
    default: true
  },

  title: {
    type: String,
    required: true
  },

  issn: {
    type: String
  },

  eissn: {
    type: String
  },

  source: {
    type: String,
    default: ""
  },

  cover: {
    type: String,
    default: ""
  },

  added: {
    type: Date
  },

  latestPubdate: {
    type: Date
  },

  views: {
    type: Number,
    default: 0
  },

  updated: {
    type: Date
  },

  categories: [{
    type: Mongoose.Schema.Types.ObjectId,
    ref: "Category",
    default: []
  }]
},
  // Schema options
  {
    toObject: {
      virtuals: true
    },
    toJSON: {
      virtuals: true
    },
    id: false
  });


journalSchema.virtual("identifier").get(function (this: IJournal) {
  return this.issn ? this.issn : this.eissn ? this.eissn : "";
});


// Set Date when the journal was added
journalSchema.pre<IJournal>("save", function (next) {
  this.added = new Date();
  this.updated = new Date();
  return next();
});


// Delete all articles of the removed journal aswell
// ! TODO: This hook doesn't work properly (this._id is undefined)
journalSchema.pre<IJournal>("deleteOne", function (next: HookNextFunction) {
  Article.deleteMany({ publishedIn: this._id })
    .exec()
    .then(result => {
      return next();
    })
    .catch(err => {
      return next(err);
    });
});


// Increment view counter
journalSchema.method("incViews", function (this: IJournal) {
  this.update({ $inc: { views: 1 } })
    .exec()
    .catch(err => {
      throw err;
    });
});


journalSchema.plugin(MongoosePaginate);


export const Journal = Mongoose.model<IJournal, IJournalModel>(
  "Journal",
  journalSchema
);
