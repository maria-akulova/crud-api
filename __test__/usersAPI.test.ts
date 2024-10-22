import { server } from '../src';
import supertest from 'supertest';
import { IRequestBody } from '../src/models/userModel';

const request = supertest(server);

const houswife: IRequestBody = {
  username: 'Anna Maria',
  age: 17,
  hobbies: ['music', 'sky'],
};

const oldGentelmen: IRequestBody = {
  username: 'Emile DeBecaulaur',
  age: 100,
  hobbies: ['gardening', 'golf'],
};

const expectUser = (received: unknown, expected: IRequestBody): void => {
  expect(received).toMatchObject({
    username: expected.username,
    age: expected.age,
    hobbies: expected.hobbies,
  });
};

describe('Crud-API of user', (): void => {
  beforeAll((): void => {
    const PORT: string | 4001 = process.env.PORT || 4001;
    server.close();
    server.listen(PORT);
  });

  afterAll(async (): Promise<void> => {
    await new Promise((resolve): void => {
      server.close(resolve);
    });
  });

  let createdUserId: string;

  describe('Get all users', (): void => {
    it('should return an empty array at start', async (): Promise<void> => {
      const { status, body } = await request.get('/api/users');
      expect(status).toBe(200);
      expect(body).toStrictEqual([]);
    });
  });

  describe('Create new user', (): void => {
    it('Create new houswife', async (): Promise<void> => {
      const { status, body } = await request
        .post('/api/users')
        .send(houswife)
        .set('Content-Type', 'application/json');

      createdUserId = body.id;
      expect(status).toBe(201);
      expect(body).toHaveProperty('id');
      expectUser(body, houswife);
    });
  });

  describe('Receive just created user details', (): void => {
    it('User created with correct params', async (): Promise<void> => {
      const { status, body } = await request.get(`/api/users/${createdUserId}`);

      expect(status).toBe(200);
      expect(body).toHaveProperty('id', createdUserId);
      expectUser(body, houswife);
    });
  });

  describe('Update user details', (): void => {
    it('Update user by ID', async (): Promise<void> => {
      const { status, body } = await request
        .put(`/api/users/${createdUserId}`)
        .send(oldGentelmen)
        .set('Content-Type', 'application/json');

      expect(status).toBe(200);
      expect(body).toHaveProperty('id', createdUserId);
      expectUser(body, oldGentelmen);
    });
  });

  describe('Delete user', (): void => {
    it('Delete user by ID', async (): Promise<void> => {
      const { status } = await request.delete(`/api/users/${createdUserId}`);

      expect(status).toBe(204);
    });
  });

  describe('Errors', (): void => {
    it('Missing props', async (): Promise<void> => {
      const incompleteUser = { username: 'guest' };
      const message =
        'Invalid request body. Check all data: username, age, hobbies. All data is required.';
      const { status, body } = await request
        .post('/api/users')
        .send(incompleteUser)
        .set('Content-Type', 'application/json');

      expect(status).toBe(400);
      expect(body).toHaveProperty('message', message);
    });

    it('User not found', async (): Promise<void> => {
      const { status, body } = await request.get(`/api/users/${createdUserId}`);

      expect(status).toBe(404);
      expect(body).toHaveProperty('message', 'User not found');
    });

    it('Internal Server Error', async (): Promise<void> => {
      const { status, body } = await request.get('/api/users/error');

      expect(status).toBe(500);
      expect(body).toHaveProperty('message', 'Internal Server Error');
    });
  });


});
