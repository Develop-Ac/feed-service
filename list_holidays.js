const http = require('http');

const options = {
    hostname: 'localhost',
    port: 8001,
    path: '/feriados?ano=2026',
    method: 'GET',
};

const req = http.request(options, (res) => {
    console.log(`STATUS: ${res.statusCode}`);
    res.setEncoding('utf8');
    let rawData = '';
    res.on('data', (chunk) => { rawData += chunk; });
    res.on('end', () => {
        try {
            const parsedData = JSON.parse(rawData);
            console.log('Result:', JSON.stringify(parsedData, null, 2));
        } catch (e) {
            console.error(e.message);
            console.log('Raw data:', rawData);
        }
    });
});

req.on('error', (e) => {
    console.error(`problem with request: ${e.message}`);
});

req.end();
