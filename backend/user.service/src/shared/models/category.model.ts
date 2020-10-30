import Mongoose from "mongoose";
import { Schema } from "mongoose";
import { ICategory, ICategoryModel } from "../interfaces/category.interface";

import MongoosePaginate from "mongoose-paginate-v2";

export const categorySchema: Schema = new Schema({
  title: {
    type: String,
    minlength: [3, "Category.title must be at least 3 characters long"],
    required: [true, "Category.title is required"],
    unique: [true, "Category with this title already exists"],
  },

  color: {
    type: String,
    default: "#0099ff",
  },

  display: {
    type: Boolean,
    default: false,
  },
});

categorySchema.plugin(MongoosePaginate);

export const Category = Mongoose.model<ICategory, ICategoryModel>(
  "Category",
  categorySchema
);
