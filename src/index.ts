import 'dotenv/config';
import http from 'http';
import cluster from 'cluster';
import { availableParallelism } from 'os';
import { parseEnv } from './utils/commands';
import { router } from './routes/routes';

const PORT = parseInt(process.env.PORT) || 4000;
let workerPort = PORT;

export const userServer = http.createServer(router);

const app = () => {
  const isCluster = parseEnv('loadBalancer');
  if (isCluster) {
    runServerWithLoadBalancer();
  } else {
    userServer.listen(PORT, () => {
      console.log(`Server running at http://localhost:${PORT}/`);
    });
  }
};

const runServerWithLoadBalancer = async () => {
  if (cluster.isPrimary) {
    const numCPUs = availableParallelism();
    console.log(`Primary ${process.pid} is running`);
    const workerPool = Array.from({ length: numCPUs }, async () =>
      cluster.fork(),
    );

    await Promise.all(workerPool);

    cluster.on('exit', (worker) => {
      console.log(`Primary is ${worker.process.pid} died`);
    });

    cluster.on('message', async (worker, message) => {
      console.log(
        `Primary send the message to worker: ${JSON.stringify(message)}`,
      );

      worker.send(message);
    });
  } else {
    workerPort += 1;
    if (cluster.worker?.id) {
      createWorker(workerPort, process.pid, cluster.worker.id);
    }
  }

  process.on('message', (message) => {
    console.log(
      `Worker received the message from Primary: ${JSON.stringify(message)}`,
    );
  });
};

const createWorker = (port: number, procesID: number, workerID: number) => {
  userServer.listen(port, () => {
    console.log(
      `Worker ${procesID} with id = ${workerID} server running at http://localhost:${port}/`,
    );
  });
};

app();
