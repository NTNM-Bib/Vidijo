// TODO: remove this service (reuse xlsx -> json code in client)
// TODO: also remove service in docker-compose and scripts

require("dotenv").config()
const Express = require("express")
const XLSX = require("xlsx")
const BodyParser = require("body-parser")
const FileUpload = require("express-fileupload")
const Path = require("path")
const Mongoose = require("mongoose")
const { Journal } = require("./db/journal.schema")
const { Category } = require("./db/category.schema")
const FS = require("fs")

//Mongoose.connect("mongodb://database:27017/vidijo", {
Mongoose.connect(process.env.MONGODB_URI || "mongodb://database:27017/vidijo", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})

Mongoose.connection.on(
  "error",
  console.error.bind(console, "connection error:")
)
Mongoose.connection.once("open", (_) => {
  console.log("Connected to the database.")
  app.listen(3000, (_) => {
    console.log("Server running on port 3000...")
  })
})
Mongoose.connection.on("error", (err) => {
  process.exit(2)
})
Mongoose.connection.on("close", () => {
  process.exit(3)
})

const app = Express()

app.use(
  FileUpload({
    createParentPath: true,
  })
)

app.use(BodyParser.json())

// Upload an xlsx sheet with journals
// title, issn, eissn, categories, cover
app.post("/", async (req, res, next) => {
  let journalsFileName = ""
  let journals = []

  try {
    if (!req.files) {
      console.error("No files")

      res.status(400).json({
        error: {
          message: "No file uploaded",
        },
      })
    } else {
      // Create "uploads" folder if it doesn't exist
      if (!FS.existsSync(Path.normalize(`${__dirname}/uploads/`))) {
        FS.mkdirSync(Path.normalize(`${__dirname}/uploads/`))
      }

      const journalsFile = req.files.journals
      journalsFileName = Path.normalize(
        `${__dirname}/uploads/${journalsFile.name}`
      )
      console.log(journalsFileName)
      await journalsFile.mv(`./uploads/${journalsFile.name}`)

      const journalTable = await XLSX.readFile(`./uploads/${journalsFile.name}`)
      journals = await XLSX.utils.sheet_to_json(journalTable.Sheets["journals"])

      // List categories in a single cell separated by ";"
      // Split this single string into an array
      // Finally remove surrounding whitespaces
      for await (let journal of journals) {
        if (journal.categories) {
          journal.categories = journal.categories.split(";").map((category) => {
            return category.trim()
          })

          let storedCategories = []
          for await (const category of journal.categories) {
            const upsertedCategory = await Category.findOneAndUpdate(
              { title: category },
              { title: category },
              {
                upsert: true,
                new: true,
                setDefaultsOnInsert: true,
                useFindAndModify: false,
              }
            ).catch((err) => {
              return next(err)
            })

            storedCategories.push(upsertedCategory._id)
            journal.categories = storedCategories
          }
        }

        journal.added = new Date()
        journal.updated = new Date(0) // 1970/1/1

        console.log(`Added ${journal.title}`)

        await Journal.findOneAndUpdate({ title: journal.title }, journal, {
          upsert: true,
          new: true,
          setDefaultsOnInsert: true,
          useFindAndModify: false,
        }).catch((err) => {
          return next(err)
        })
      }

      return res.json(journals)
    }
  } catch (err) {
    return next(err)
  }
})

if (process.env.NODE_ENV !== "production") {
  process.once("uncaughtException", function (err) {
    console.error("FATAL: Uncaught exception.")
    console.error(err.stack || err)
    setTimeout(function () {
      process.exit(1)
    }, 100)
  })
}

function errorHandler(err, req, res, next) {
  if (res.headersSent) {
    return next(err)
  }
  res.status(500)
  res.json({
    error: `${err}`,
  })
}

app.use(errorHandler)
