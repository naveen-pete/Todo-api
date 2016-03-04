var express = require('express');
var bodyParser = require('body-parser');
var _ = require('underscore');

var app = express();
var PORT = process.env.PORT || 3000;
var todos = [];
var todoNextId = 1;

app.use(bodyParser.json());

app.get('/', function (req, res) {
	res.send('Todo API Root');
});

app.get('/todos', function (req, res) {
	res.json(todos);
});

app.get('/todos/:id', function (req, res) {
	var todoId = parseInt(req.params.id);
	var matchedTodo = _.findWhere(todos, {id: todoId});
	if(matchedTodo) {
		res.json(matchedTodo);
	} else {
		res.status(404).send();
	}
});

app.post('/todos', function (req, res) {
	var newTodo = _.pick(req.body, 'description', 'completed');

	if(!_.isBoolean(newTodo.completed) || 
		!_.isString(newTodo.description) || 
		newTodo.description.trim().length <= 0) {
		return res.status(400).send();
	}

	newTodo.description = newTodo.description.trim();
	newTodo.id = todoNextId++;

	todos.push(newTodo);

	res.json(newTodo);
});

app.delete('/todos/:id', function (req, res) {
	var todoId = parseInt(req.params.id);
	var matchedTodo = _.findWhere(todos, {id: todoId});
	if(matchedTodo) {
		todos = _.without(todos, matchedTodo);
		res.json(matchedTodo);
	} else {
		res.status(404).json({error: 'Requested todo item not found.'});
	}
});

app.listen(PORT, function () {
	console.log('Express server started and listening on port ' + PORT + '!');
});
