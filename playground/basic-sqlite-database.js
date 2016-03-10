var Sequelize = require('sequelize');
var sequelize = new Sequelize(undefined, undefined, undefined, {
	'dialect': 'sqlite',
	'storage': __dirname + '/basic-sqlite-database.sqlite'
});

var Todo = sequelize.define('todo', {
	description: {
		type: Sequelize.STRING,
		allowNull: false,
		validate: {
			len: [1, 250]
		}
	},
	completed: {
		type: Sequelize.BOOLEAN,
		allowNull: false,
		defaultValue: false
	}
})

sequelize.sync({
	//force: true
}).then(function() {
	console.log('Everything is synced');

	Todo.findOne({
		where: {
			id: 3
		}
	}).then(function(todo) {
		if(todo) {
			console.log(todo.toJSON());
		} else {
			console.log('No todo found.');
		}
	}).catch(function(e) {
		console.log(e);
	});

	// Todo.create({
	// 	description: 'Take out trash'
	// }).then(function(todo) {
	// 	return Todo.create({
	// 		description: 'Clean office'
	// 	})
	// }).then(function() {
	// 	//return Todo.findById(2);
	// 	return Todo.findOne({
	// 		where: {
	// 			id: 3
	// 		}
	// 	});
	// }).then(function(todo) {
	// 	console.log('Finished!');
	// 	if (todo) {
	// 		console.log(todo.toJSON());
	// 	} else {
	// 		console.log('no todo found.');
	// 	}
	// }).catch(function(e) {
	// 	console.log(e);
	// });
});
