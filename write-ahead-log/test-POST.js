import {createRequire} from 'module';
const require = createRequire(import.meta.url);

const client = require('node-fetch');

(async () => {
    const resp = await client('http://localhost:3000/log',{
        method: 'POST',
        headers:{
            'Content-Type':'application/json'
        },
        body:JSON.stringify({
            type:"Batch",
            key1: 'name',
            value1: 'NewYork',
            key2: 'weight',
            value2:33
        })
    });
    const data = await resp.json();
    console.log(data);
})();


for(let i=0; i<10000; i++){
    const key = i;
    const value = 0;
    
    (async () => {
        const resp = await client('http://localhost:3000/log',{
            method: 'POST',
            headers:{
                'Content-Type':'application/json'
            },
            body:JSON.stringify({
                type:"Entry",
                key:key,
                value: value
            })
        });
        const data = await resp.json();
        console.log(data);
    })();
}
(async () => {
    const resp = await client('http://localhost:3000/log',{
        method: 'POST',
        headers:{
            'Content-Type':'application/json'
        },
        body:JSON.stringify({
            type:"Batch",
            key1: 'test',
            value1: '10000',
            key2: 'status',
            value2:1
        })
    });
    const data = await resp.json();
})();
