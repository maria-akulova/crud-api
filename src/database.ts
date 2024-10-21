import cluster from 'node:cluster';
import { ClusterMessage } from './types';
import { IUser } from './models/userModel';

interface Database {
  [key: string]: unknown;
}

const database: Database = {};

if (cluster.isPrimary) {
  cluster.on('message', (worker, workerMessage: ClusterMessage): void => {
    const { action, key, value } = workerMessage;

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

export const usersData = {
  get: (key: string): Promise<unknown> => {
    return new Promise((resolve): void => {
      if (cluster.isPrimary) {
        resolve(database[key]);
      } else {
        process.send?.({ action: 'get', key });
        process.once('message', (workerMessage: ClusterMessage): void => {
          if (workerMessage.key === key) resolve(workerMessage.value);
        });
      }
    });
  },

  set: (key: string, value: IUser[]): void => {
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
