// https://medium.com/disney-streaming/setup-a-single-sign-on-saml-test-environment-with-docker-and-nodejs-c53fc1a984c9

// server
const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');

// SAML
const passport = require('passport');
const saml = require('passport-saml');

const fs = require('fs');


// app setup

let app = express();

app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

app.use(session({secret: 'secret', 
				 resave: false, 
				 saveUninitialized: true,}));


// routes


app.get('/',
	function(req, res) {
		res.send('Test Home Page');	// TODO: login with eIDAS button
	}
);


app.get('/login',
	function (req, res, next) {
		console.log('-----------------------------');
		console.log('/Start login handler');
		next();
	},
	passport.authenticate('samlStrategy'),
);

app.post('/login/callback',
	function (req, res, next) {
		console.log('-----------------------------');
		console.log('/Start login callback ');
		next();
	},
	passport.authenticate('samlStrategy'),
	function (req, res) {
		console.log('-----------------------------');
		console.log('login call back dumps');
		console.log(req.user);
		console.log('-----------------------------');
		res.send('Log in Callback Success');
	}
);

app.get('/metadata',
	function(req, res) {
		res.type('application/xml'); 
		res.status(200).send(
			samlStrategy.generateServiceProviderMetadata(
			 fs.readFileSync(__dirname + '/certificates/ASPSP_authentication.crt', 'utf8'),	// decryptionCert.pem
			 fs.readFileSync(__dirname + '/certificates/ASPSP_nonRepudiation.crt', 'utf8')		// signingCert.pem
			)
		);
	}
);

// passport setup

passport.serializeUser(function(user, done) {
	console.log('-----------------------------');
	console.log('serialize user');
	console.log(user);
	console.log('-----------------------------');
	done(null, user);
});
passport.deserializeUser(function(user, done) {
	console.log('-----------------------------');
	console.log('deserialize user');
	console.log(user);
	console.log('-----------------------------');
	done(null, user);
});


const samlStrategy = new saml.Strategy({
	entryPoint: 'http://localhost:8080/simplesaml/saml2/idp/SSOService.php',	// SP redirects the user with a SAML request to this url
	callbackUrl: 'http://localhost/login/callback',		// IDP will post SAML response here
	issuer: 'saml-poc',	// the SP
	identifierFormat: null,	// SP requests this from the IDP but the option will be specified by the IDP
	decryptionPvk: fs.readFileSync(__dirname + '/certificates/ASPSP_authentication.key', 'utf8'),	// decryptionKey.pem
	privateCert: fs.readFileSync(__dirname + '/certificates/ASPSP_nonRepudiation.crt', 'utf8'), // signingKey.pem
	validateInResponseTo: false,	// whether to validate SAML responses from the IDP
	disableRequestedAuthnContext: true
}, function(profile, done) {
	return done(null, profile);
});

passport.use('samlStrategy', samlStrategy);

app.use(passport.initialize({}));
app.use(passport.session({}));


// start server

const server = app.listen(4300, function () {
	console.log(`Listening on port ${server.address().port}`)
});




