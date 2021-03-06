const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const passport = require('passport');
const users = require('./routes/api/users');
const profile = require('./routes/api/profile');
const posts = require('./routes/api/posts');
const app = express();

app.use(
	bodyParser.urlencoded({ extended: false })
);
app.use(bodyParser.json());

//DB config
const db = require('./config/keys').mongoURI;

//Connect MongoDb
mongoose
	.connect(db, {
		useNewUrlParser: true,
		useUnifiedTopology: true,
	})

	.then(() => {
		console.log('MongoDb Connected');
	})
	.catch((err) => {
		console.log(err);
	});

//passport middleware
app.use(passport.initialize());
//passport config
require('./config/passport')(passport);

app.use('/api/users', users);
app.use('/api/profile', profile);
app.use('/api/posts', posts);

const port = process.env.PORT || 5000;

app.listen(port, () => {
	console.log(`App running on port ${port}`);
});
