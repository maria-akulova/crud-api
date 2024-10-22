import { IncomingMessage, ServerResponse } from 'node:http';
import { validate as isUuid } from 'uuid';
import { IUser, IRequestBody } from '../models/userModel';
import { parseRequestBody } from '../middleware/parseRequestBody';
import { createErrorResponse } from '../utils/errorHandler';
import {
    getAllUsers as fetchAllUsers,
    getUserById as fetchUserById,
    createUser as addUser,
    updateUser as modifyUser,
    deleteUser as removeUser,
} from '../services/userService';

const message500 = 'Internal server error';
const message404 = 'User not found';
const response400 = (res: ServerResponse) => {
    return sendResponse(res, 400, createErrorResponse(400, 'Invalid User ID or format'));
};

const sendResponse = (res: ServerResponse, status: number, data: unknown): void => {
    res.writeHead(status, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(data));
};

export const getAllUsers = async (_req: IncomingMessage, res: ServerResponse): Promise<void> => {
    try {
        const users: IUser[] = await fetchAllUsers();
        sendResponse(res, 200, users);
    } catch (error) {
        console.error(error);
        sendResponse(res, 500, createErrorResponse(500, message500));
    }
};

export const getUserById = async (
    _req: IncomingMessage,
    res: ServerResponse,
    id: string,
): Promise<void> => {
    if (!isUuid(id)) {
        response400(res);
    }

    try {
        const user: IUser | undefined = await fetchUserById(id);
        if (!user) {
            return sendResponse(res, 404, createErrorResponse(404, message404));
        }
        sendResponse(res, 200, user);
    } catch (error) {
        console.error(error);
        sendResponse(res, 500, createErrorResponse(500, message500));
    }
};

export const createUser = async (req: IncomingMessage, res: ServerResponse): Promise<void> => {
    try {
        const { username, age, hobbies }: IRequestBody = await parseRequestBody(req);

        if (!username || !age || !Array.isArray(hobbies)) {
            return sendResponse(
                res,
                400,
                createErrorResponse(
                    400,
                    'Invalid request body. Check all data: username, age, hobbies. All data is required.',
                ),
            );
        }

        const newUser: IUser = await addUser({ username, age, hobbies });

        sendResponse(res, 201, newUser);
    } catch (error) {
        console.error(error);
        sendResponse(res, 500, createErrorResponse(500, message500));
    }
};

export const updateUser = async (
    req: IncomingMessage,
    res: ServerResponse,
    id: string,
): Promise<void> => {
    if (!isUuid(id)) {
        response400(res);
    }

    try {
        const updatedData: Partial<Omit<IUser, 'id'>> = await parseRequestBody(req);
        const user: IUser | null = await modifyUser(id, updatedData);
        if (!user) {
            return sendResponse(res, 404, createErrorResponse(404, message404));
        }

        sendResponse(res, 200, user);
    } catch (error) {
        console.error(error);
        sendResponse(res, 500, createErrorResponse(500, message500));
    }
};

export const deleteUser = async (
    _req: IncomingMessage,
    res: ServerResponse,
    id: string,
): Promise<void> => {
    if (!isUuid(id)) {
        response400(res);
    }

    try {
        const success: boolean = await removeUser(id);
        if (!success) {
            return sendResponse(res, 404, createErrorResponse(404, message404));
        }
        res.writeHead(204).end();
    } catch (error) {
        console.error(error);
        sendResponse(res, 500, createErrorResponse(500, message500));
    }
};
