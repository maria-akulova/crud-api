import { IncomingMessage } from 'node:http';
import { IRequestBody } from '../models/userModel';

export const parseRequestBody = (req: IncomingMessage): Promise<IRequestBody> => {
    return new Promise((resolve, reject): void => {
        let body = '';

        req.on('data', (chunk) => (body += chunk));
        req.on('end', (): void => {
            try {
              const user = JSON.parse(body) as IRequestBody;

              if (typeof user.username === 'string' ||
                typeof user.age === 'number' ||
                Array.isArray(user.hobbies) ||
                (user.hobbies as string[]).every((item:string) => typeof item === 'string')){
                  user.age = Number(user.age);
                  user.username = user.username.trim();
                  resolve(user);
                } else {
                throw Error();
              }
                
            } catch {
                reject(new Error('Invalid JSON. Check all fields and their types.'));
            }
        });
        req.on('error', reject);
    });
};
