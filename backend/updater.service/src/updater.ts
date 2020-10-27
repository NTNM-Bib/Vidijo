import UpdaterConfig from "./updater.config";

import Axios from "axios";
import { IJournal } from "./shared/interfaces";
import { Journal } from "./shared/models";
import { Logger } from "./shared";

// Update the journal with oldest data
export async function updateOldestJournal(): Promise<number> {
  const promise: Promise<number> = new Promise(async (resolve, reject) => {
    const oldestJournal: IJournal | null = await Journal.findOne()
      .sort({ updated: 1 })
      .exec()
      .catch((err) => {
        return reject(err);
      });

    if (!oldestJournal) {
      return reject(new Error("Cannot find a journal to update"));
    }

    Logger.log(
      `Updating journal ${oldestJournal.title} (${oldestJournal._id})`
    );

    await Axios.put(
      `${UpdaterConfig.EXTERNAL_DATA_SERVICE_URI}/v1/journals/update/${oldestJournal._id}`
    ).catch((err: Error) => {
      Logger.error(err);
    });

    return resolve(1);
  });

  return promise;
}
