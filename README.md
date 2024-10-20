# CRUD API
## Description
Task is to implement simple CRUD API using in-memory database underneath.

[Task Detailed Description](https://github.com/AlreadyBored/nodejs-assignments/blob/main/assignments/crud-api/assignment.md)

## Technical requirements
- Use 22.9.0 LTS version of Node.js
- Use TypeScript


## Start
1. Clone the project from repository
```bash
git clone git@github.com:maria-akulova/crud-api.git
```

2. Check current version of node
```bash
node -v
```

If node is not according to technical requirements, apply correct version
```bash
nvm use 22.9.0
```
3. Install dependencies
```bash
npm i
```
4. Rename .env.example 
```bash
# If you are using unix/linux terminal
mv .env.example .env
```


### Scripts to run
#### Build an application
```bash
# Build mode
npm run build
```
### Run Application

You can run application in 3 modes:
- Dev
- Prod
- Prod with load balancer

Use Dev  mode if you want to investigate, debug the app.

Use Prod  mode if you want to run app as it will be in real condition on the production.

Use Prod  mode with load balancer if you want to run app as it will be in real condition on the production and you expect a lot of requests. 


```bash
# Development mode
npm run start:dev
```

```bash
# Production mode
$ npm run start:prod
```
```bash
# Production mode with load balancer
$ npm run start:multi
```

### Run tests
```bash
npm run test
```

### Routes

| Methods |                 Route                   | Description |
|:-------:|---------------------------------------|------------ |
|   GET   | http://localhost:4000/api/users  |to get all users |
|   GET   | http://localhost:4000/api/users/{:id} |to get user by id (uuid)|
|  POST   | http://localhost:4000/api/users | to create record about new user and store it in database|
|   PUT   | http://localhost:4000/api/users/{:id} | to update existing user (all fields required), could be use for creation new user|
| DELETE  | http://localhost:4000/api/users/{:id} | to delete existing user from database|

___


