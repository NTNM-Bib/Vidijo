import UpdaterConfig from './updater.config'
import Axios from 'axios'
import { IJournal } from 'vidijo-lib/lib/interfaces'
import { Journal } from 'vidijo-lib/lib/models'
import Logger from 'vidijo-lib/lib/logger'

/**
 * Update the journal with oldest data
 */
export async function updateOldestJournal() {
  const oldestJournal: IJournal | null = await Journal.findOne()
    .sort({ updated: 1 })
    .exec()

  if (!oldestJournal) {
    throw new Error('Cannot find a journal to update')
  }

  Logger.log(`Updating journal ${oldestJournal.title} (${oldestJournal._id})`)

  return Axios.put(
    `${UpdaterConfig.EXTERNAL_DATA_SERVICE_URI}/v1/journals/update/${oldestJournal._id}`
  )
}
