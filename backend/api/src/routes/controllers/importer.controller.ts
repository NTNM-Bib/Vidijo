import ApiConfig from '../../api.config'
import { Request, Response, NextFunction } from 'express'
import Axios, { AxiosResponse } from 'axios'
import CreateError from 'http-errors'
import XLSX from 'xlsx'
import fileUpload from 'express-fileupload'
import { IJournal, VidijoData, VidijoDataInfo } from '../../shared/interfaces'
import { Logger } from '../../shared'
import { Journal } from '../../shared/models'

class ImporterController {
  /**
   * Import the uploaded list of Vidijo data to this route
   *
   * @param req
   * @param res
   * @param next
   */
  public importXLSX(req: Request, res: Response, next: NextFunction) {
    // TODO: Implement
  }

  /**
   * Return the amount of new journals, ... in the provided .xlsx file
   *
   * @param req
   * @param res
   * @param next
   */
  public checkXLSX(req: Request, res: Response, next: NextFunction) {
    Promise.resolve(req)
      .then(checkUploadedFile)
      .then(convertXLSXToVidijoData)
      .then(createInfoObject)
      .then((info) => {
        return res.json(info)
      })
      .catch(next)
  }
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

  //const issnQuery = Journal.where('issn').in(issnArray).count()
  const journalsToAddQuery = Journal.find({
    $or: [{ issn: { $in: issnArray } }, { eissn: { $in: eissnArray } }],
  }).count()
  //const journalsQuery = Journal.find().count().exec()
  /*
  const eissnQuery = Journal.where('eissn').in(eissnArray).select('_id')
  const journalsQuery = issnQuery.intersects(eissnQuery).count()
  */

  return journalsToAddQuery.exec().then(async (alreadyExisting) => {
    return {
      journalsInDatabase: await Journal.find().count().exec(),
      journalsOnList: vidijoData.journals.length,
      journalsToAdd: vidijoData.journals.length - alreadyExisting,
    } as VidijoDataInfo
  })

  /*
  return issnQuery.exec().then((alreadyExisting) => {
    const numJournals = vidijoData.journals.reduce((acc) => acc + 1, 0)
    const info = {
      journals: numJournals,
      newJournals: numJournals - alreadyExisting,
    } as VidijoDataInfo

    return info
  })
  */
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

  if (
    req.files.vidijodata.mimetype !==
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  ) {
    throw CreateError(
      400,
      `You must upload a file with mime type application/vnd.openxmlformats-officedocument.spreadsheetml.sheet. You uploaded ${req.files.vidijoData.mimetype}`
    )
  }

  return req.files.vidijodata
}

export default new ImporterController()
