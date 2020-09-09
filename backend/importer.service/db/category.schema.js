const mongoose = require("mongoose")
const Schema = mongoose.Schema
const ObjectId = Schema.ObjectId

const categorySchema = new Schema({
  title: { type: String, required: true },
  color: { type: String, default: "#0088cc" },
})

const Category = mongoose.model("Category", categorySchema)

module.exports = {
  Category,
}
