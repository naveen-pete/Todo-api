var express = require('express');
var bodyParser = require('body-parser');
var _ = require('underscore');
var db = require('./db.js');
var bcrypt = require('bcryptjs');
var middleware = require('./middleware.js')(db);

var app = express();
var PORT = process.env.PORT || 3000;
var todos = [];
var todoNextId = 1;

app.use(bodyParser.json());

app.get('/', function(req, res) {
	res.send('Todo API Root');
});

app.post('/todos', middleware.requireAuthentication, function(req, res) {
	var newTodo = _.pick(req.body, 'description', 'completed');

	db.todo.create(newTodo).then(function(todo) {
		req.user.addTodo(todo).then(function() {
			return todo.reload();
		}).then(function(todo) {
			res.json(todo.toJSON());
		});
	}).catch(function(e) {
		res.status(400).json(e);
	});
});

app.get('/todos', middleware.requireAuthentication, function(req, res) {
	var query = req.query;
	var where = {
		userId: req.user.id
	};

	if (query.hasOwnProperty('completed') && query.completed === 'true') {
		where.completed = true;
	} else if (query.hasOwnProperty('completed') && query.completed === 'false') {
		where.completed = false;
	}

	if (query.hasOwnProperty('q') && query.q.length > 0) {
		where.description = {
			$like: '%' + query.q + '%'
		};
	}

	db.todo.findAll({
		where: where
	}).then(function(todos) {
		res.json(todos);
	}).catch(function(e) {
		res.status(500).json({
			"error": "Error occurred."
		});
	});
});

app.get('/todos/:id', middleware.requireAuthentication, function(req, res) {
	var todoId = parseInt(req.params.id);

	db.todo.findOne({
		where: {
			id: todoId,
			userId: req.user.id
		}
	}).then(function(todo) {
		if (todo) {
			res.json(todo.toJSON());
		} else {
			res.status(404).json({
				"error": "No todo found for id '" + todoId + "'"
			});
		}
	}).catch(function(e) {
		res.status(500).json({
			"error": "Error occurred."
		});
	});
});

app.delete('/todos/:id', middleware.requireAuthentication, function(req, res) {
	var todoId = parseInt(req.params.id);

	db.todo.destroy({
		where: {
			id: todoId,
			userId: req.user.id
		}
	}).then(function(rowsDeleted) {
		if (rowsDeleted === 0) {
			res.status(404).json({
				"error": "No todo found for id '" + todoId + "'"
			});
		} else {
			res.json({
				"message": "Todo deleted successfully."
			});
		}
	}).catch(function(e) {
		res.status(500).json({
			"error": "Error occurred."
		});
	});
});

app.put('/todos/:id', middleware.requireAuthentication, function(req, res) {
	var todoId = parseInt(req.params.id);
	var body = _.pick(req.body, 'description', 'completed');
	var attributes = {};

	if (body.hasOwnProperty('completed')) {
		attributes.completed = body.completed;
	}

	if (body.hasOwnProperty('description')) {
		attributes.description = body.description;
	}

	db.todo.findOne({
		where: {
			id: todoId,
			userId: req.user.id
		}
	}).then(function(todo) {
		if (todo) {
			todo.update(attributes).then(function(todo) {
				res.json(todo.toJSON());
			}, function(e) {
				res.status(400).json({
					"error": "Error occurred."
				});
			});
		} else {
			res.status(404).json({
				"error": "No todo found for id '" + todoId + "'"
			});
		}
	}, function(e) {
		res.status(500).json({
			"error": "Error occurred."
		});
	});
});

app.post('/users', function(req, res) {
	var newUser = _.pick(req.body, 'email', 'password');

	db.user.create(newUser).then(function(user) {
		res.json(user.toPublicJSON());
	}).catch(function(e) {
		res.status(400).json(e);
	});
});

app.post('/users/login', function(req, res) {
	var body = _.pick(req.body, 'email', 'password');
	var userInstance;

	db.user.authenticate(body).then(function(user) {
		var token = user.generateToken('authentication');
		userInstance = user;

		return db.token.create({
			token: token
		});
	}).then(function(tokenInstance) {
		if (tokenInstance) {
			res.header('Auth', tokenInstance.token).json(userInstance.toPublicJSON());
		} else {
			res.status(401).json({
				error: 'Error occurred.'
			});
		}
	}).catch(function(e) {
		res.status(401).json(e);
	});
});

app.delete('/users/login', middleware.requireAuthentication, function(req, res) {
	req.token.destroy().then(function(rowsDeleted) {
		if (rowsDeleted === 0) {
			res.status(404).json({
				"error": "No token found"
			});
		} else {
			res.json({
				message: 'Logout successful.'
			});
		}
	}).catch(function() {
		res.status(500).json({
			"error": "Error occurred."
		});
	});
});

db.sequelize.sync({
	force: true
}).then(function() {
	app.listen(PORT, function() {
		console.log('Express server started and listening on port ' + PORT + '!');
	});
});
