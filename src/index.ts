import 'dotenv/config';
import http from 'http';
import cluster, { Worker } from 'cluster';
import os from 'os';
import { parseEnv } from './utils/commands';
import { routes } from './routes/routes';
import { userDB } from './services/usersDB';

const PORT = parseInt(process.env.PORT || '4000');

// A shared in-memory "database" for simplicity

// Round-robin tracking for load balancer
let currentWorkerIndex = 0;
const workers: Worker[] = [];

export const app = http.createServer(routes);

export const bootstrap = () => {
    if (parseEnv('loadbalancer')) {
        if (cluster.isPrimary) {
            const numCPUs = os.cpus().length - 1; // Use all but 1 CPU for workers
            console.log(`Primary ${process.pid} is running...`);

            // Fork workers
            for (let i = 0; i < numCPUs; i++) {
                const worker = cluster.fork();
                workers.push(worker);
            }

            // Load balancer on primary process
            const loadBalancer = http.createServer((req, res) => {
                // Forward requests to workers in round-robin manner
                const worker = workers[currentWorkerIndex];
                currentWorkerIndex = (currentWorkerIndex + 1) % workers.length;

                console.log(`Forwarding request to worker ${worker.process.pid}`);
                const options = {
                    hostname: 'localhost',
                    port: PORT + (currentWorkerIndex + 1), // Workers listening on incremented ports
                    path: req.url,
                    method: req.method,
                    headers: req.headers,
                };

                // Forward the request to the worker
                const proxyReq = http.request(options, (proxyRes) => {
                    res.writeHead(proxyRes.statusCode || 200, proxyRes.headers);
                    proxyRes.pipe(res, { end: true });
                });

                req.pipe(proxyReq, { end: true });
            });

            // Start load balancer
            loadBalancer.listen(PORT, () => {
                console.log(`Load balancer running on http://localhost:${PORT}/`);
            });

            cluster.on('exit', (worker) => {
                console.log(`Worker ${worker.process.pid} died, restarting...`);
                const newWorker = cluster.fork();
                workers.push(newWorker);
            });
        } else {
            // Worker servers listening on incremented ports
            const workerPort = PORT + cluster.worker!.id!;
            app.listen(workerPort, () => {
                console.log(`Worker ${process.pid} listening on http://localhost:${workerPort}/`);
            });

            // Worker handling requests and updating shared state
            app.on('request', (req, res) => {
                if (req.url === '/users' && req.method === 'GET') {
                    res.writeHead(200, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify(userDB)); // Read users
                } else if (req.url === '/users' && req.method === 'POST') {
                    let body = '';
                    req.on('data', (chunk) => {
                        body += chunk.toString();
                    });
                    req.on('end', () => {
                        const newUser = JSON.parse(body);
                        userDB.push(newUser); // Update users
                        res.writeHead(200, { 'Content-Type': 'application/json' });
                        res.end(JSON.stringify(newUser));
                    });
                }
                // Other routes can go here, e.g. DELETE, UPDATE, etc.
            });
        }
    } else {
        // Run as a single non-clustered server
        app.listen(PORT, () => {
            console.log(`Server running at http://localhost:${PORT}/`);
        });
    }
};
