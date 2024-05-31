import KVStore from './KVStore.js';
import noWAL_KVStore from './noWAL_KVStore.js';
import { PrintLog } from './PrintLog.js'


//let kv = new noWAL_KVStore('./LogFile',5, 1000, './database.csv');
let kv = new KVStore('./LogFile',5, 1000, './database.csv');

console.log(kv.getMap());

kv.put('day', 1);
kv.put('day', 2);
kv.put_CrashTest('day', 3);
//process.kill(process.pid,'SIGTERM');

kv.put('day', 4);
kv.put('hour',16);
kv.put('hour',10);
kv.put('time',12);


let batch = new Map();
batch.set('name', 'New York');
batch.set('age', 33);
kv.putBatch_CrashTest(batch);


//kv.put('time',11);
console.log(kv.getMap());

//kv.cleanLog(true);
