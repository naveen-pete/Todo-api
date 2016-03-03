var express = require('express');
var app = express();
var PORT = process.env.PORT || 3000;
var todos = [{
	id: 1,
	description: 'Meet mom for lunch',
	completed: false
}, {
	id: 2,
	description: 'Go to market',
	completed: false
}, {
	id: 3,
	description: 'Get milk from dairy',
	completed: true
}];

app.get('/', function (req, res) {
	res.send('Todo API Root');
});

app.get('/todos', function (req, res) {
	res.json(todos);
});

app.get('/todos/:id', function (req, res) {
	var todoId = parseInt(req.params.id);
	var matchedTodo = getTodo(todoId);
	if(matchedTodo) {
		res.json(matchedTodo);
	} else {
		res.status(404).send();
	}
});

app.listen(PORT, function () {
	console.log('Express server started and listening on port ' + PORT + '!');
});

function getTodo(todoId) {
	var matchedTodo;
	var i = 0;
	while (!matchedTodo && i < todos.length) {
		if(todos[i].id === todoId) {
			matchedTodo = todos[i];
		}
		i++;
	}
	return matchedTodo;
}
