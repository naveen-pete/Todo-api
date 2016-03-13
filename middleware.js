var cryptojs = require('crypto-js');

module.exports = function(db) {
	return {
		requireAuthentication: function(req, res, next) {
			var token = req.get('Auth');
			var hash = cryptojs.MD5(token).toString();

			db.token.findOne({
				where: {
					tokenHash: hash
				}
			}).then(function(tokenInstance) {
				if (!tokenInstance) {
					throw new Error('Error occurred.');
				}

				req.token = tokenInstance;
				return db.user.findByToken(token);
			}).then(function(user) {
				req.user = user;
				next();
			}).catch(function(e) {
				res.status(401).json(e);
			});
		}
	};
};