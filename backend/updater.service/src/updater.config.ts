/**
 * =-- Updater Service Config --=
 * IMPORTANT: THIS MUST BE THE FIRST IMPORT IN THE MAIN ENTRY SCRIPT FILE
 * Only relevant to this service
 * Extends DefaultConfig
 */

import { DefaultConfigClass } from "./shared/default.config";


export class UpdaterConfigClass extends DefaultConfigClass {

    public UPDATE_INTERVAL: number = this.getUpdateInterval();


    private getUpdateInterval(): number {
        if (!process.env.UPDATE_INTERVAL) {
            console.warn("UPDATE_INTERVAL not set in .env file. Using UPDATE_INTERVAL=10 instead");
        }
        let updateInterval: number = process.env.UPDATE_INTERVAL ? +process.env.UPDATE_INTERVAL : 10;
        updateInterval = isNaN(updateInterval) ? 10 : updateInterval;

        return updateInterval;
    }

}


export default new UpdaterConfigClass();