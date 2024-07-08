import { createServer } from 'http';

const server = createServer((req, res) => {
  res.writeHead(200, {
    Content_Type: 'text/plain',
  });
  res.write('hello node.js');
  res.end();
});

server.listen(3000, () => {
  console.log('server is Listening on port 3000');
});
