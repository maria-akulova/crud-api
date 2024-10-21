import { IUser } from '../models/userModel';
import { v4 } from 'uuid';

const users: IUser[] = [];

export const getAllUsers = (): IUser[] => users;

export const getUserById = (id: string): IUser | undefined =>
  users.find((user: IUser): boolean => user.id === id);

export const createUser = (data: Omit<IUser, 'id'>): IUser => {
  const newUser: IUser = { id: v4(), ...data };
  users.push(newUser);
  return newUser;
};

export const updateUser = (
  id: string,
  data: Partial<Omit<IUser, 'id'>>,
): IUser | null => {
  const userIndex: number = users.findIndex(
    (user: IUser): boolean => user.id === id,
  );
  if (userIndex === -1) { return null; }

  users[userIndex] = { ...users[userIndex], ...data };

  return users[userIndex];
};

export const deleteUser = (id: string): boolean => {
  const index: number = users.findIndex(
    (user: IUser): boolean => user.id === id,
  );
  if (index === -1) { return false; }

  users.splice(index, 1);

  return true;
};