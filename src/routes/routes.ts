import 'dotenv/config';
import http from 'http';
import { randomUUID } from 'crypto';
import { userDB } from 'src/services/usersDB';

// Routes for handling user operations
export const routes = (req: http.IncomingMessage, res: http.ServerResponse) => {
    if (req.url === '/users' && req.method === 'GET') {
        // GET all users
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(userDB));
    } else if (req.url === '/users' && req.method === 'POST') {
        // POST (Create a new user)
        let body = '';
        req.on('data', (chunk) => {
            body += chunk.toString();
        });
        req.on('end', () => {
            try {
                const user = JSON.parse(body);
                const newUser = { id: randomUUID(), ...user };
                userDB.push(newUser); // Add user to in-memory DB
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ message: 'User created', user: newUser }));
            } catch {
                res.writeHead(400, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ message: 'Invalid JSON' }));
            }
        });
    } else {
        // If route is not matched
        res.writeHead(404, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ message: 'Route not found' }));
    }
};
