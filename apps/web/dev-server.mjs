import http from 'node:http';

const port = Number(process.env.WEB_PORT ?? 5173);
const apiPort = Number(process.env.API_PORT ?? 3000);

const html = `<!doctype html>
<html lang="pt-BR">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>AppStart</title>
    <style>
      body { font-family: system-ui, sans-serif; margin: 0; padding: 2rem; background: #0f172a; color: #e2e8f0; }
      main { max-width: 48rem; margin: 0 auto; }
      code { background: #1e293b; padding: 0.125rem 0.375rem; border-radius: 0.25rem; }
      a { color: #38bdf8; }
    </style>
  </head>
  <body>
    <main>
      <h1>AppStart</h1>
      <p>Frontend de desenvolvimento ativo.</p>
      <p>API esperada em <code>http://localhost:${apiPort}/api/v1</code>.</p>
    </main>
  </body>
</html>`;

const server = http.createServer((_request, response) => {
  response.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
  response.end(html);
});

server.listen(port, () => {
  console.log(`[web] ouvindo em http://localhost:${port}`);
});
