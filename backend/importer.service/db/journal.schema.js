const mongoose = require("mongoose")
const Schema = mongoose.Schema
const ObjectId = Schema.ObjectId

const journalSchema = new Schema({
  title: { type: String, required: true },
  issn: { type: String },
  eissn: { type: String },
  cover: { type: String },
  categories: { type: [ObjectId], ref: "Category" },
  added: { type: Date },
  updated: { type: Date },
})

const Journal = mongoose.model("Journal", journalSchema)

module.exports = {
  Journal,
}
