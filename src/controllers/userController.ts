import { IncomingMessage, ServerResponse } from 'node:http';
import { validate as isUuid } from 'uuid';
import { IUser } from '../models/userModel';
import {
  getAllUsers as fetchAllUsers,
  getUserById as fetchUserById,
  createUser as addUser,
  updateUser as modifyUser,
  deleteUser as removeUser,
} from '../services/userService';

interface IRequestBody extends Omit<IUser, 'id'> {
  username: string;
  age: number;
  hobbies: string[];
}

const parseRequestBody = (req: IncomingMessage): Promise<IRequestBody> => {
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

export const getAllUsers = async (
  _req: IncomingMessage,
  res: ServerResponse,
): Promise<void> => {
  const users: IUser[] = fetchAllUsers();

  res.writeHead(200, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify(users));
};

export const getUserById = async (
  _req: IncomingMessage,
  res: ServerResponse,
  id: string,
) => {
  if (!isUuid(id)) {
    res.writeHead(400, { 'Content-Type': 'application/json' });
    return res.end(JSON.stringify({ message: 'Invalid User ID or format' }));
  }

  const user: IUser | undefined = fetchUserById(id);

  if (!user) {
    res.writeHead(404, { 'Content-Type': 'application/json' });
    return res.end(JSON.stringify({ message: 'User not found' }));
  }

  res.writeHead(200, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify(user));
};

export const createUser = async (req: IncomingMessage, res: ServerResponse) => {
  try {
    const { username, age, hobbies }: IRequestBody =
      await parseRequestBody(req);

    if (!username || !age || !Array.isArray(hobbies)) {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify({ message: 'Invalid request body' }));
    }

    const newUser: IUser = addUser({ username, age, hobbies });

    res.writeHead(201, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(newUser));
  } catch {
    res.writeHead(500, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ message: 'Internal server error' }));
  }
};

export const updateUser = async (
  req: IncomingMessage,
  res: ServerResponse,
  id: string,
) => {
  if (!isUuid(id)) {
    res.writeHead(400, { 'Content-Type': 'application/json' });
    return res.end(JSON.stringify({ message: 'Invalid User ID or format' }));
  }

  try {
    const updatedData: Partial<Omit<IUser, 'id'>> = await parseRequestBody(req);
    const user: IUser | null = modifyUser(id, updatedData);

    if (!user) {
      res.writeHead(404, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify({ message: 'User not found' }));
    }

    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(user));
  } catch {
    res.writeHead(500, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ message: 'Internal server error' }));
  }
};

export const deleteUser = async (
  _req: IncomingMessage,
  res: ServerResponse,
  id: string,
) => {
  if (!isUuid(id)) {
    res.writeHead(400, { 'Content-Type': 'application/json' });
    return res.end(JSON.stringify({ message: 'Invalid UUID' }));
  }

  const success: boolean = removeUser(id);
  if (!success) {
    res.writeHead(404, { 'Content-Type': 'application/json' });
    return res.end(JSON.stringify({ message: 'User not found' }));
  }

  res.writeHead(204).end();
};