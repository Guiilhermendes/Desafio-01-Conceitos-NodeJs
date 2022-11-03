const express = require('express');
const cors = require('cors');

const { v4: uuidv4 } = require('uuid');

const app = express();

app.use(cors());
app.use(express.json());

let users = [];

function checksExistsUserAccount(request, response, next) {
  const { username } = request.headers;
  const userAccount = users.find(el => el.username === username);
  if (!userAccount) { return response.status(404).json({ error: 'User not found!' }); }
  request.userAccount = userAccount;
  return next()
}

app.post('/users', (request, response) => {
  const { name, username } = request.body

  const existUserAccount = users.find(el => el.username === username)
  if (existUserAccount) { return response.status(400).json({ error: 'User already exists!' }); }

  const newUser = {
    id: uuidv4(),
    name,
    username,
    todos: []
  };
  users = [...users, newUser];

  return response.status(201).json(newUser)
});

app.get('/todos', checksExistsUserAccount, (request, response) => {
  const { userAccount } = request;
  return response.status(200).json(userAccount.todos)
});

app.post('/todos', checksExistsUserAccount, (request, response) => {
  const { userAccount } = request;
  const { title, deadline } = request.body;

  const newTodo = {
    id: uuidv4(),
    title,
    done: false,
    deadline: new Date(deadline),
    created_at: new Date()
  }
  userAccount.todos.push(newTodo);

  return response.status(201).json(newTodo);
});

app.put('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { userAccount } = request;
  const { title, deadline } = request.body;
  const { id } = request.params;
  if (!id) return response.status(400).json({ error: 'Missing id!' });

  let updateTodo = userAccount.todos.find(el => el.id === id);
  if (!updateTodo) return response.status(404).json({ error: 'Todo not found!' });

  updateTodo.title = title;
  updateTodo.deadline = new Date(deadline);

  return response.status(200).json(updateTodo);
});

app.patch('/todos/:id/done', checksExistsUserAccount, (request, response) => {
  const { userAccount } = request;
  const { id } = request.params;
  if (!id) return response.status(400).json({ error: 'Missing id!' });

  let updateTodoToDone = userAccount.todos.find(el => el.id === id);
  if (!updateTodoToDone) return response.status(404).json({ error: 'Todo not found!' });

  updateTodoToDone.done = true;

  return response.status(200).json(updateTodoToDone);
});

app.delete('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { userAccount } = request;
  const { id } = request.params;
  if (!id) return response.status(400).json({ error: 'Missing id!' });

  let deleteTodo = userAccount.todos.find(el => el.id === id);
  if (!deleteTodo) return response.status(404).json({ error: 'Todo not found!' });

  userAccount.todos.splice(deleteTodo, 1)

  return response.status(204).json(userAccount);
});

module.exports = app;