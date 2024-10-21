import { IUser } from '../models/userModel';
import { v4 } from 'uuid';

const users: IUser[] = [];

export const getAllUsers = async (): Promise<IUser[]> => users;

export const getUserById = async (id: string): Promise<IUser | undefined> =>
  users.find((user: IUser): boolean => user.id === id);

export const createUser = async (data: Omit<IUser, 'id'>): Promise<IUser> => {
  const newUser: IUser = { id: v4(), ...data };
  users.push(newUser);
  return newUser;
};

export const updateUser = async (
  id: string,
  data: Partial<Omit<IUser, 'id'>>,
): Promise<IUser | null> => {
  const userIndex: number = users.findIndex(
    (user: IUser): boolean => user.id === id,
  );
  if (userIndex === -1) {
    return null;
  }

  users[userIndex] = { ...users[userIndex], ...data };

  return users[userIndex];
};

export const deleteUser = async (id: string): Promise<boolean> => {
  const index: number = users.findIndex(
    (user: IUser): boolean => user.id === id,
  );
  if (index === -1) {
    return false;
  }

  users.splice(index, 1);

  return true;
};