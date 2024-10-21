import 'dotenv/config';
import { requestHandler } from './middleware/requestHandler';
import { parseEnv } from './utils/commands';
import * as process from 'node:process';
import 'dotenv/config';
import { availableParallelism } from 'node:os';
import cluster from 'node:cluster';
import { createServer, IncomingMessage, ServerResponse, request, ClientRequest } from 'node:http';

const PORT = Number(process.env.PORT) || 4000;
const isCluster = parseEnv('loadbalancer');
export const server = createServer(requestHandler);

const runServer = () => {
    server.listen(PORT, () => console.log(`Server is running on PORT: ${PORT}`));
};

const runServerWithLoadBalancer = () => {
    const numCPUs = availableParallelism() - 1;

    if (cluster.isPrimary) {
        console.log(`Master ${process.pid} is running...`);

        const loadBalancer = createServer((req: IncomingMessage, res: ServerResponse): void => {
            const workerId: number = ((req.headers['x-forwarded-for'] ? 1 : 2) % numCPUs) + 1;
            const targetPort: number = PORT + workerId;

            const options = {
                hostname: 'localhost',
                port: targetPort,
                path: req.url,
                method: req.method,
                headers: req.headers,
            };

            const proxyRequest: ClientRequest = request(options, (workerRes): void => {
                const statusCode = workerRes.statusCode ?? 500;
                res.writeHead(statusCode, workerRes.headers);
                workerRes.pipe(res, { end: true });
            });

            proxyRequest.on('error', (error): void => {
                console.error(`Proxy request error: ${error.message}`);
                res.writeHead(502);
                res.end('Bad Gateway');
            });

            req.pipe(proxyRequest, { end: true });
        });

        loadBalancer.listen(PORT, () => console.log(`Load Balancer is listening on PORT: ${PORT}`));

        Array.from({ length: numCPUs }, () => cluster.fork());

        cluster.on('exit', (worker, code, signal): void => {
            console.log(`Worker ${worker.process.pid} exited. Code: ${code}, Signal: ${signal}`);
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
};

if (isCluster) {
    runServerWithLoadBalancer();
} else {
    runServer();
}
