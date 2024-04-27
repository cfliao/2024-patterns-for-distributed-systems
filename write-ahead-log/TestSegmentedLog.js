import KVStore from './KVStore.js';
import { PrintLog } from './PrintLog.js'

let kv = new KVStore('./LogFile',3);


for(let i=0; i<4; i++)
    kv.put('Data', i);


kv.put('Data', 4);  //wal_1.log is full, has five lines

//console.log('\nPrint wal_1.log:')

//PrintLog('./LogFile/wal_1.log');

kv.put('Data', 5);  //wal_1.log rotate

//wal_2.log been created 
//put the data:5 into wal_2.log

//the current path in kv's wal system is wal_2.log now


kv.put('Data', 6) //putting Data:6 into wal_2.log

let batch = new Map();
batch.set('name', 'New York');
batch.set('age', 33);
kv.putBatch(batch); // putting the Batch into wal_2.log


console.log(kv.getLogData(5));


//Segmented Log treat the log data as a line of text
//regarding the data is batch or normal data, the same function works in Batch.


//console.log(kv.getMap());


