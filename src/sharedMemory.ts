import cluster from 'node:cluster';

interface ClusterMessage {
  action: 'get' | 'set' | 'delete';
  key: string;
  value?: unknown;
}

interface Database {
  [key: string]: unknown;
}

const database: Database = {};

if (cluster.isPrimary) {
  cluster.on('message', (worker, msg: ClusterMessage): void => {
    const { action, key, value } = msg;

    switch (action) {
      case 'get':
        worker.send({ key, value: database[key] });
        break;
      case 'set':
        database[key] = value;
        break;
      case 'delete':
        delete database[key];
        break;
    }
  });
}

export const sharedMemory = {
  get: (key: string): Promise<unknown> => {
    return new Promise((resolve): void => {
      if (cluster.isPrimary) {
        resolve(database[key]);
      } else {
        process.send?.({ action: 'get', key });
        process.once('message', (msg: ClusterMessage): void => {
          if (msg.key === key) resolve(msg.value);
        });
      }
    });
  },

  set: (key: string, value: unknown): void => {
    if (cluster.isPrimary) {
      database[key] = value;
    } else {
      process.send?.({ action: 'set', key, value });
    }
  },

  delete: (key: string): void => {
    if (cluster.isPrimary) {
      delete database[key];
    } else {
      process.send?.({ action: 'delete', key });
    }
  },
};
