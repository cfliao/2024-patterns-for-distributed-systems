import KVStore from './KVStore.js';
import {createRequire} from 'module';
const require = createRequire(import.meta.url);
const server = require('fastify')();

let kv = new KVStore('./LogFile', 5);


server.get('/log/:Index', function(req, res){
    const dataIndex = parseInt(req.params.Index);
    const data = kv.getLogData(dataIndex);
    if(data !== -1){
        return data;
    }
    else{
        return {"error":"not found"};
    }
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
