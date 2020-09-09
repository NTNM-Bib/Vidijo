/**
 * =-- User Service Config --=
 * IMPORTANT: THIS MUST BE THE FIRST IMPORT IN THE MAIN ENTRY SCRIPT FILE
 * Only relevant to this service
 * Extends DefaultConfig
 */

import { DefaultConfigClass } from "./shared/default.config";


export class UserConfigClass extends DefaultConfigClass {


}


export default new UserConfigClass();