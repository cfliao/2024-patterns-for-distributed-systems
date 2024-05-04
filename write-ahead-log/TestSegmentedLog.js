import KVStore from './KVStore.js';
import { PrintLog } from './PrintLog.js'

let kv = new KVStore('./LogFile',5);


console.log(kv.getMap());

kv.cleanLog(true);
