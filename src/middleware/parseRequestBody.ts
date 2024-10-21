import { IncomingMessage } from 'node:http';
import { IRequestBody } from '../models/userModel';

export const parseRequestBody = (
  req: IncomingMessage,
): Promise<IRequestBody> => {
  return new Promise((resolve, reject): void => {
    let body = '';

    req.on('data', (chunk) => (body += chunk));
    req.on('end', (): void => {
      try {
        resolve(JSON.parse(body) as IRequestBody);
      } catch {
        reject(new Error('Invalid JSON'));
      }
    });
    req.on('error', reject);
  });
};
