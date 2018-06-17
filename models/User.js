const mongoose = require('mongoose');
const { Schema } = require('mongoose');

const userSchema = new Schema({
	username: {
		type: String,
		required: [
			function() {
				return !this.googleID;
			},
			'username is required if googleID is not specified'
		]
	},
	password: {
		type: String,
		required: [
			function() {
				return !!this.username;
			},
			'password is required if username is specified'
		]
	},
	createdAt: {
		type: Date,
		default: Date.now()
	},
	token: {
		type: String,
		default: ''
	},
	googleID: {
		type: String,
		required: [
			function() {
				return !this.username;
			},
			'googleID is required if username is not specified'
		]
	}
});

mongoose.model('users', userSchema);
