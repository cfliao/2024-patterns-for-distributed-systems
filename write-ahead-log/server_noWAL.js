import noWAL_KVStore from './noWAL_KVStore.js';
import {createRequire} from 'module';
const require = createRequire(import.meta.url);
const server = require('fastify')();

let kv = new noWAL_KVStore('./LogFile', 1000,1000,'./database.csv');



server.post('/test', function(req, res){
    console.log("boston reduce 40, and pune increase 40");
    const data = req.body;
    let batch = new Map();
    batch.set(data.key1, data.value1);
    batch.set(data.key2, data.value2);
    kv.putBatch_CrashTest(batch);
});



server.post('/log', function(req, res){
    const data = req.body;
    if(data.type === "Batch"){
        const key1 = data.key1;
        const key2 = data.key2;
        const value1 = data.value1;
        const value2 = data.value2;

        let batch = new Map();
        batch.set(key1, value1);
        batch.set(key2, value2);
        kv.putBatch(batch);
    }
    else{
        kv.put(data.key, data.value);
    }

    return data;
});

server.listen(3000, "127.0.0.1");
