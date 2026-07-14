import http from 'http';

function hitEndpoint(url: string) {
  console.log(`Sending GET request to ${url}...`);
  http.get(url, (res) => {
    console.log('Response Status:', res.statusCode);
    console.log('Response Headers:', res.headers);
    
    let data = '';
    res.on('data', (chunk) => { data += chunk; });
    res.on('end', () => {
      console.log('Response Body:', data);
    });
  }).on('error', (err) => {
    console.error('Request failed! Error:', err.message);
  });
}

// Check health and endpoint
hitEndpoint('http://localhost:3001/health');
