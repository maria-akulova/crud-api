import { server } from '../src';
import supertest from 'supertest';
import { IRequestBody } from '../src/models/userModel';

const request = supertest(server);

const mockUser: IRequestBody = {
  username: 'John Smith',
  age: 35,
  hobbies: ['mock tests'],
};

const updatedUser: IRequestBody = {
  username: 'John Doe',
  age: 40,
  hobbies: ['unit testing', 'integration testing'],
};

const expectUser = (received: unknown, expected: IRequestBody): void => {
  expect(received).toMatchObject({
    username: expected.username,
    age: expected.age,
    hobbies: expected.hobbies,
  });
};

describe('User API', (): void => {
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

  describe('GET /api/users', (): void => {
    it('should return an empty array', async (): Promise<void> => {
      const { status, body } = await request.get('/api/users');
      expect(status).toBe(200);
      expect(body).toStrictEqual([]);
    });
  });

  describe('POST /api/users', (): void => {
    it('should create and return a new user containing expected records', async (): Promise<void> => {
      const { status, body } = await request
        .post('/api/users')
        .send(mockUser)
        .set('Content-Type', 'application/json');

      createdUserId = body.id;
      expect(status).toBe(201);
      expect(body).toHaveProperty('id');
      expectUser(body, mockUser);
    });

    it('should return 400 "Invalid request body..." while creating User with missing props', async (): Promise<void> => {
      const incompleteUser = { username: 'Noname' };
      const message =
        'Invalid request body: username, age, and hobbies are required';
      const { status, body } = await request
        .post('/api/users')
        .send(incompleteUser)
        .set('Content-Type', 'application/json');

      expect(status).toBe(400);
      expect(body).toHaveProperty('message', message);
    });
  });

  describe('GET /api/users/:id', (): void => {
    it('should return created user by ID', async (): Promise<void> => {
      const { status, body } = await request.get(`/api/users/${createdUserId}`);

      expect(status).toBe(200);
      expect(body).toHaveProperty('id', createdUserId);
      expectUser(body, mockUser);
    });
  });

  describe('PUT /api/users/:id', (): void => {
    it('should update and return created user by ID', async (): Promise<void> => {
      const { status, body } = await request
        .put(`/api/users/${createdUserId}`)
        .send(updatedUser)
        .set('Content-Type', 'application/json');

      expect(status).toBe(200);
      expect(body).toHaveProperty('id', createdUserId);
      expectUser(body, updatedUser);
    });
  });

  describe('DELETE /api/users/:id', (): void => {
    it('should delete created user by ID', async (): Promise<void> => {
      const { status } = await request.delete(`/api/users/${createdUserId}`);

      expect(status).toBe(204);
    });
  });

  describe('GET /api/users/:id (non-existent user)', (): void => {
    it('should return 404 "User not found"', async (): Promise<void> => {
      const { status, body } = await request.get(`/api/users/${createdUserId}`);

      expect(status).toBe(404);
      expect(body).toHaveProperty('message', 'User not found');
    });
  });

  describe('GET /api/users/error (non-existent route)', (): void => {
    it('should return 500 "Internal Server Error"', async (): Promise<void> => {
      const { status, body } = await request.get('/api/users/error');

      expect(status).toBe(500);
      expect(body).toHaveProperty('message', 'Internal Server Error');
    });
  });
});
