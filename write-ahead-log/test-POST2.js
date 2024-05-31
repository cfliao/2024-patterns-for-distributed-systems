import { createRequire } from 'module';
const require = createRequire(import.meta.url);

const client = require('node-fetch');

const maxRetries = 10; // Number of retries
const retryDelay = 1000; // Delay in milliseconds

async function postData(url, data) {
    let attempts = 0;
    while (attempts < maxRetries) {
        try {
            const resp = await client(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            });
            if (!resp.ok) throw new Error(`HTTP error! status: ${resp.status}`);
            
            const responseData = await resp.json();
            console.log(responseData);
            return responseData;
        } catch (error) {
            console.error(`Attempt ${attempts + 1} failed: ${error.message}`);
            attempts++;
            if (attempts < maxRetries) {
                console.log(`Retrying in ${retryDelay / 1000} seconds...`);
                await new Promise(res => setTimeout(res, retryDelay));
            } else {
                console.log('Max retries reached. Giving up.');
            }
        }
    }
}

(async () => {
    await postData('http://localhost:3000/log', {
        type: "Batch",
        key1: 'name',
        value1: 'NewYork',
        key2: 'weight',
        value2: 33
    });
})();


for (let i = 0; i < 10000; i++) {
    const key = i;
    const value = 0;

    (async () => {
        await postData('http://localhost:3000/log', {
            type: "Entry",
            key: key,
            value: value
        });
    })();
}

(async () => {
    await postData('http://localhost:3000/log', {
        type: "Batch",
        key1: 'test',
        value1: '10000',
        key2: 'status',
        value2: 1
    });
})();

