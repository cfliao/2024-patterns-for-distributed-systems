import {createRequire} from 'module';
const require = createRequire(import.meta.url);

const client = require('node-fetch');

const data = new Map([
    ["boston"      , 50],
    ["philadelphia", 38],
    ["london"      , 20],
    ["pune"        , 75]
]);


for(const [key, value] of data){
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
    const resp = await client('http://localhost:3000/test',{
        method: 'POST',
        headers:{
            'Content-Type':'application/json'
        },
        body:JSON.stringify({
            type:"Batch",
            key1:'boston',
            value1:10,
            key2:'pune',
            value2:115
        })
    });
    const data = await resp.json();
    console.log(data);
})();



