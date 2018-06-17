module.exports = {
	jwtSecret: process.env.JWT_SECRET,
	mongoURI: process.env.MONGO_URI,
	saltRounds: process.env.SALT_ROUNDS,
	googleClientID: process.env.GOOGLE_CLIENT_ID,
	googleClientSecret: process.env.GOOGLE_CLIENT_SECRET
};
