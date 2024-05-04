import {createRequire} from 'module';
const require = createRequire(import.meta.url);

const client = require('node-fetch');


(async () => {
        const resp = await client('http://localhost:3000/log/2', {
                method: 'GET'
        });

        const data = await resp.text();
        console.log(data);
})();

