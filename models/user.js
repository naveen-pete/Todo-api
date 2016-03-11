var bcrypt = require('bcryptjs');
var _ = require('underscore');
var cryptojs = require('crypto-js');
var jwt = require('jsonwebtoken');

var JWT_SECRET_KEY = 'qwerty098';
var CJS_SECRET_KEY = 'abc123!@#';

module.exports = function(sequelize, DataTypes) {
	var user = sequelize.define('user', {
		email: {
			type: DataTypes.STRING,
			allowNull: false,
			unique: true,
			validate: {
				isEmail: true
			}
		},
		salt: {
			type: DataTypes.STRING
		},
		password_hash: {
			type: DataTypes.STRING
		},
		password: {
			type: DataTypes.VIRTUAL,
			allowNull: false,
			validate: {
				len: [7, 100]
			},
			set: function(value) {
				var salt = bcrypt.genSaltSync(10);
				var hashedPassword = bcrypt.hashSync(value, salt);

				this.setDataValue('password', value);
				this.setDataValue('salt', salt);
				this.setDataValue('password_hash', hashedPassword);
			}
		}
	}, {
		hooks: {
			beforeValidate: function(user, options) {
				if (_.isString(user.email)) {
					user.email = user.email.toLowerCase();
				}
			}
		},
		classMethods: {
			authenticate: function(body) {
				return new Promise(function(resolve, reject) {
					if (!_.isString(body.email) || !_.isString(body.password)) {
						return reject({
							error: 'Email or Password is not valid.'
						});
					}

					user.findOne({
						where: {
							email: body.email
						}
					}).then(function(user) {
						if (!user || !bcrypt.compareSync(body.password, user.password_hash)) {
							reject({
								error: 'Wrong email or password.'
							});
						}

						resolve(user);
					}).catch(function(e) {
						reject({
							error: 'Error occurred.'
						});
					});
				});
			},
			findByToken: function(token) {
				return new Promise(function(resolve, reject) {
					try {
						var decodedJWT = jwt.verify(token, JWT_SECRET_KEY);
						var bytes = cryptojs.AES.decrypt(decodedJWT.token, CJS_SECRET_KEY);
						var tokenData = JSON.parse(bytes.toString(cryptojs.enc.Utf8));

						user.findById(tokenData.id).then(function (user) {
							if(user) {
								resolve(user);
							} else {
								reject();
							}
						}).catch(function(e) {
							reject();
						}); 
					} catch (e) {
						reject();
					}
				});
			}
		},
		instanceMethods: {
			toPublicJSON: function() {
				var json = this.toJSON();
				return _.pick(json, 'id', 'email', 'createdAt', 'updatedAt');
			},
			generateToken: function(type) {
				if (!_.isString(type)) {
					return undefined;
				}

				try {
					var stringData = JSON.stringify({
						id: this.get('id'),
						type: type
					});
					var encryptedData = cryptojs.AES.encrypt(stringData, CJS_SECRET_KEY).toString();
					var token = jwt.sign({
						token: encryptedData
					}, JWT_SECRET_KEY);

					return token;
				} catch (e) {
					console.error(e);
					return undefined;
				}
			}
		}
	});

	return user;
};