const http = require('http');

const options = {
  hostname: 'localhost',
  port: 5001,
  path: '/api/masters/projectSchedule?page=1&limit=100&sortBy=Sch_Id&sortOrder=DESC',
  method: 'GET',
};

const req = http.request(options, (res) => {
  let data = '';
  res.on('data', (chunk) => { data += chunk; });
  res.on('end', () => {
    console.log('Status Code:', res.statusCode);
    console.log('Response:', data.substring(0, 500) + (data.length > 500 ? '...' : ''));
  });
});

req.on('error', (error) => {
  console.error('Error:', error.message);
});

req.end();
