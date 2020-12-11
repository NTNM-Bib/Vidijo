import ApiConfig from '../../api.config'
import { Request, Response, NextFunction } from 'express'
import Axios from 'axios'
import CreateError from 'http-errors'
import XLSX from 'xlsx'
import fileUpload from 'express-fileupload'
import { IJournal, VidijoData, VidijoDataInfo } from 'vidijo-lib/lib/interfaces'
import { Logger } from 'vidijo-lib'
import { Journal } from 'vidijo-lib/lib/models'

/**
 * Import the uploaded list of Vidijo data to this route
 *
 * @param req
 * @param res
 * @param next
 */
export function importXLSX(req: Request, res: Response, next: NextFunction) {
  Promise.resolve(req)
    .then(checkUploadedFile)
    .then(convertXLSXToVidijoData)
    .then(importVidijoData)
    .then((status) => res.json(status))
    .catch(next)
}

/**
 * Return the amount of new journals, ... in the provided .xlsx file
 *
 * @param req
 * @param res
 * @param next
 */
export function checkXLSX(req: Request, res: Response, next: NextFunction) {
  Promise.resolve(req)
    .then(checkUploadedFile)
    .then(convertXLSXToVidijoData)
    .then(createInfoObject)
    .then((info) => res.json(info))
    .catch(next)
}

/**
 * Import the journals contained in the given VidijoData object from DOAJ
 * Only saves the first page of articles (at most 100)
 *
 * @param vidijoData
 */
function importVidijoData(vidijoData: VidijoData) {
  const wait = (delay: number) =>
    new Promise((resolve) => setTimeout(resolve, delay))

  let promises: Promise<any>[] = []
  for (let i = 0; i < vidijoData.journals.length; ++i) {
    const journal = vidijoData.journals[i]
    const delay = i * 3000
    const promise = wait(delay)
      .then(() => {
        Logger.log(`Importing journal ${journal.eissn ?? journal.issn}`)
      })
      .then(() =>
        wait(delay).then(() =>
          Axios.post(
            `${ApiConfig.EXTERNAL_DATA_SERVICE_URI}/v1/journals`,
            journal
          )
        )
      )

    promises = [...promises, promise]
  }

  return Promise.allSettled(promises)
}

/**
 * Returns an info object to the given VidijoData
 * This object contains the number of journals and categories that will be added
 * This method queries the database to get already existing journals and categories
 *
 * @param vidijoData
 */
function createInfoObject(vidijoData: VidijoData): Promise<VidijoDataInfo> {
  const issnArray = vidijoData.journals.reduce(
    (acc, j) => (j.issn ? [...acc, j.issn] : acc),
    [] as string[]
  )
  const eissnArray = vidijoData.journals.reduce(
    (acc, j) => (j.eissn ? [...acc, j.eissn] : acc),
    [] as string[]
  )

  const journalsToAddQuery = Journal.find({
    $or: [{ issn: { $in: issnArray } }, { eissn: { $in: eissnArray } }],
  }).count()

  return journalsToAddQuery.exec().then(async (alreadyExisting: any) => {
    return {
      journalsInDatabase: await Journal.find().count().exec(),
      journalsOnList: vidijoData.journals.length,
      journalsToAdd: vidijoData.journals.length - alreadyExisting,
    } as VidijoDataInfo
  })
}

/**
 * Converts the uploaded .xlsx file to VidijoData
 *
 * @param uploadedFile
 */
function convertXLSXToVidijoData(
  uploadedFile: fileUpload.UploadedFile
): VidijoData {
  const data = { journals: [], categories: [] } as VidijoData

  const workbook = XLSX.read(uploadedFile.data, { type: 'buffer' })

  const journals = <any[]>XLSX.utils.sheet_to_json(workbook.Sheets['journals'])
  for (let journal of journals) {
    data.journals.push(journal as IJournal)
  }

  return data
}

/**
 * Check if the uploaded Vidijo data file was uploaded correctly
 *
 * @param req The express request object
 */
function checkUploadedFile(req: Request) {
  if (!req.files) {
    throw CreateError(400, 'No file was attached to this request')
  }

  if (!req.files.vidijodata) {
    throw CreateError(
      400,
      'Cannot find the .xlsx file attached to this request (in files.vidijodata)'
    )
  }

  req.files.vidijodata = req.files.vidijodata as fileUpload.UploadedFile

  if (
    req.files.vidijodata.mimetype !==
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  ) {
    throw CreateError(
      400,
      `You must upload a file with mime type application/vnd.openxmlformats-officedocument.spreadsheetml.sheet. You uploaded ${req.files.vidijodata.mimetype}`
    )
  }

  return req.files.vidijodata
}
