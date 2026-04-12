const http = require('http');
const fs = require('fs');
const path = require('path');
const dir = path.join(__dirname, 'docs', 'management');
const types = {'.html':'text/html','.js':'text/javascript','.css':'text/css','.ttf':'font/ttf','.png':'image/png','.jpg':'image/jpeg','.svg':'image/svg+xml','.json':'application/json'};
http.createServer((req, res) => {
  let f = path.join(dir, decodeURIComponent(req.url.split('?')[0]));
  if (f.endsWith(path.sep)) f += 'index.html';
  fs.readFile(f, (err, data) => {
    if (err) { res.writeHead(404); res.end('Not found'); return; }
    res.writeHead(200, {'Content-Type': types[path.extname(f)] || 'application/octet-stream', 'Access-Control-Allow-Origin': '*'});
    res.end(data);
  });
}).listen(8791, () => console.log('Serving on http://localhost:8791'));
