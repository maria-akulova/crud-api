import { IncomingMessage, ServerResponse } from 'node:http';
import { validate as isUuid } from 'uuid';
import { IUser, IRequestBody } from '../models/userModel';
import { parseRequestBody } from '../middleware/parseRequestBody';
import { createErrorResponse } from '../utils/errorHandler'
import {
  getAllUsers as fetchAllUsers,
  getUserById as fetchUserById,
  createUser as addUser,
  updateUser as modifyUser,
  deleteUser as removeUser,
} from '../services/userService';

const sendResponse = (
  res: ServerResponse,
  status: number,
  data: unknown,
): void => {
  res.writeHead(status, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify(data));
};

export const getAllUsers = async (
  _req: IncomingMessage,
  res: ServerResponse,
): Promise<void> => {
  const users: IUser[] = fetchAllUsers();

  sendResponse(res, 200, users);
};

export const getUserById = async (
  _req: IncomingMessage,
  res: ServerResponse,
  id: string,
): Promise<void> => {
  if (!isUuid(id)) {
    return sendResponse(
      res,
      400,
      createErrorResponse(400, 'Invalid User ID or format'),
    );
  }

  const user: IUser | undefined = fetchUserById(id);
  if (!user) {
    return sendResponse(res, 404, createErrorResponse(404, 'User not found'));
  }

  sendResponse(res, 200, user);
};

export const createUser = async (req: IncomingMessage, res: ServerResponse) => {
  try {
    const { username, age, hobbies }: IRequestBody =
      await parseRequestBody(req);

    if (!username || !age || !Array.isArray(hobbies)) {
      return sendResponse(
        res,
        400,
        createErrorResponse(
          400,
          'Invalid request body: username, age, and hobbies are required',
        ),
      );
    }

    const newUser: IUser = addUser({ username, age, hobbies });

    sendResponse(res, 201, newUser);
  } catch (error) {
    console.error(error);
    sendResponse(res, 500, createErrorResponse(500, 'Internal server error'));
  }
};

export const updateUser = async (
  req: IncomingMessage,
  res: ServerResponse,
  id: string,
): Promise<void> => {
  if (!isUuid(id)) {
    return sendResponse(
      res,
      400,
      createErrorResponse(400, 'Invalid User ID or format'),
    );
  }

  try {
    const updatedData: Partial<Omit<IUser, 'id'>> = await parseRequestBody(req);
    const user: IUser | null = modifyUser(id, updatedData);
    if (!user) {
      return sendResponse(res, 404, createErrorResponse(404, 'User not found'));
    }

    sendResponse(res, 200, user);
  } catch (error) {
    console.error(error);
    sendResponse(res, 500, createErrorResponse(500, 'Internal server error'));
  }
};

export const deleteUser = async (
  _req: IncomingMessage,
  res: ServerResponse,
  id: string,
): Promise<void> => {
  if (!isUuid(id)) {
    return sendResponse(
      res,
      400,
      createErrorResponse(400, 'Invalid User ID or format'),
    );
  }

  const success: boolean = removeUser(id);
  if (!success) {
    return sendResponse(res, 404, createErrorResponse(404, 'User not found'));
  }

  res.writeHead(204).end();
};