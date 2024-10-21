import * as process from 'node:process';
import { config } from 'dotenv';
import { cpus } from 'node:os';
import cluster from 'node:cluster';
import {
  createServer,
  IncomingMessage,
  ServerResponse,
  request,
  ClientRequest,
} from 'node:http';

import { requestHandler } from './middleware/requestHandler';

config();

const PORT: number = Number(process.env.PORT) || 4000;
const numCPUs: number = cpus().length - 1;

if (cluster.isPrimary) {
  console.log(`Master ${process.pid} is running...`);

  const loadBalancer = createServer(
    (req: IncomingMessage, res: ServerResponse): void => {
      const workerId: number =
        ((req.headers['x-forwarded-for'] ? 1 : 2) % numCPUs) + 1;
      const targetPort: number = PORT + workerId;

      const options = {
        hostname: 'localhost',
        port: targetPort,
        path: req.url,
        method: req.method,
        headers: req.headers,
      };

      const proxyRequest: ClientRequest = request(
        options,
        (workerRes): void => {
          const statusCode: number = workerRes.statusCode ?? 500;
          res.writeHead(statusCode, workerRes.headers);
          workerRes.pipe(res, { end: true });
        },
      );

      proxyRequest.on('error', (error): void => {
        console.error(`Proxy request error: ${error.message}`);
        res.writeHead(502);
        res.end('Bad Gateway');
      });

      req.pipe(proxyRequest, { end: true });
    },
  );

  loadBalancer.listen(PORT, () =>
    console.log(`Load Balancer is listening on PORT: ${PORT}`),
  );

  for (let i = 0; i < numCPUs; i++) {
    cluster.fork();
  }

  cluster.on('exit', (worker, code, signal): void => {
    console.log(
      `Worker ${worker.process.pid} exited. Code: ${code}, Signal: ${signal}`,
    );
  });
} else {
  const workerPort = PORT + (cluster.worker?.id || 1);

  const server = createServer(requestHandler);

  server.listen(workerPort, (): void => {
    console.log(`Worker ${process.pid} is listening on PORT: ${workerPort}`);
  });

  server.on('error', (error) => {
    console.error(`Error occurred in worker ${process.pid}: ${error.message}`);
  });
}
