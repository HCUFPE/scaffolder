import net from 'node:net';

export function checkPortAvailable(port, label) {
  return new Promise((resolve, reject) => {
    const server = net.createServer();

    server.once('error', (error) => {
      if (error.code === 'EADDRINUSE') {
        reject(new Error(`A porta ${port} já está em uso para ${label}. Ajuste o valor no .env ou encerre o processo que está ocupando a porta.`));
        return;
      }
      reject(error);
    });

    server.once('listening', () => {
      server.close(() => resolve());
    });

    server.listen(port, '0.0.0.0');
  });
}
