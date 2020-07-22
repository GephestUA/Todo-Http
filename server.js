const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(bodyParser.raw());
app.use(cors());

const todos = [];

app.get('/', (req, res) => {
    res.send('Hello World!');
});

app.post('/todos', (req, res) => {
    const newTodo = { 
        ...req.body,
        id: Math.random(),
        createdAt: new Date().getTime(),
     };
     todos.push(newTodo);
    res.send(newTodo);
});

app.put('/todos', (req, res) => {
     const todo = todos.find(({ id }) => req.body.id == id);
     
     todo.title = req.body.title;
     console.log(todos);
    res.send({ success: true });;
});

app.patch('/todos', (req, res) => {
    const todo = todos.find(({ id }) => req.body.id == id);
    
    todo.completed = req.body.completed;
  
   res.send({ success: true });
});

app.delete('/todos', (req, res) => {
     const todoToRemoveIndex = todos.findIndex((todo) => {
        return todo.id == req.body.id;
     });

     todos.splice(todoToRemoveIndex, 1);
     
    res.send({ success: true });;
});

app.get('/todos', (req, res) => {
    res.send(JSON.stringify(todos));
});

app.listen(8800, () => {
    console.log('server is working');
});