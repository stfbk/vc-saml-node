// https://medium.com/disney-streaming/setup-a-single-sign-on-saml-test-environment-with-docker-and-nodejs-c53fc1a984c9

// server
const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const path = require('path');

// SAML
const passport = require('passport');
const saml = require('passport-saml');

const https = require('https');
const fs = require('fs');

// JS Import
const issuer = require('./issuer.js');
const database = require('./dbHandler.js');
const controllerDocument = require('./credentials/did.json');

// Local variables
var clientIban = null;

// app setup
const app = express();
const router = express.Router();
app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

app.use(session({secret: 'secret',
				 resave: false,
				 saveUninitialized: true }));


app.use(passport.initialize());
app.use(passport.session());


app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');
app.use('/', express.static('public'));


// routes


router.get('/',
	function(req, res) {
		var err = null;
		res.render('login', err);
	}
);

router.get('/issuer',
	function(req, res) {
		res.send(controllerDocument);
	}
);


router.get('/login',
	function (req, res, next) {
		console.log('-----------------------------');
		console.log('/Start login handler');
		next();
	},
	passport.authenticate('samlStrategy'),
);

router.post('/acs',
	function (req, res, next) {
		console.log('-----------------------------');
		console.log('/Start login callback ');
		next();
	},
	passport.authenticate('samlStrategy'),
	function (req, res) {

		try {
			var dbIban = database.getName(req.user.fiscalNumber)
		} catch(err) {
			req.logout();
			res.render('login', {error: err});
		}
		

	var bankingInformation = {
		id: req.user.fiscalNumber,
		iban: dbIban
	};
		console.log('-----------------------------');
		console.log('login call back dumps');
		console.log(req.user);
		console.log('-----------------------------');
		var user = req.user;
		user.iban = bankingInformation.iban;
		res.render('home', user)
	}
);

// clientId and clientIban
router.get('/createClient', function(req, res) { //Should be POST
	var clientId = req.query.clientId;
	var clientIban = req.query.clientIban;
	
	try {
		database.createClient(clientId, clientIban);
		res.send('A new client has been created!');
	} catch(error) {
		res.send(error.message);
	}
});

router.get('/deleteClient', function(req, res) {
	var clientId = req.query.clientId;
	
	
	try {
		database.deleteClient(clientId);
		res.send('Client with ID ' + clientId + ' has been deleted');
	} catch(error) {
		res.send(error.message);
	}
});

router.get('/downloadVerifiableCredential', async (req, res) => {

	try {
		var dbIban = database.getName(req.user.fiscalNumber);
	} catch(err) {
		res.render('login', {error: err});
	}
	if(dbIban)
	var bankingInformation = {
		id: req.user.fiscalNumber,
		iban: dbIban
	};

	

	if(!fs.existsSync('/tmp/verifiableCredential' + req.user.fiscalNumber + '.json')) {
		var randomNumber = Math.floor((Math.random() * 9999999999) + 999999999);
	var verifiableCredential = await issuer.generateVerifiableCredential(bankingInformation);
	var string = fs.writeFileSync('/tmp/verifiableCredential' + req.user.fiscalNumber + '.json', JSON.stringify(verifiableCredential), function(err) {
		if(err) {
			return console.log(err);
		}
	}); 
	console.log(verifiableCredential);
	}
	
	res.download('/tmp/verifiableCredential' + req.user.fiscalNumber + '.json', 'VerifiableCredential.json');
  })

router.get('/metadata',
	function(req, res) {
		res.type('application/xml');
		res.status(200).send(
			samlStrategy.generateServiceProviderMetadata(
			 fs.readFileSync(__dirname + '/certs/ASPSP_nonRepudiation.crt', 'utf8'),	// decryptionCert.pem
			 fs.readFileSync(__dirname + '/certs/ASPSP_nonRepudiation.crt', 'utf8')		// signingCert.pem
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
	entryPoint: 'https://localhost:7000/saml/sso',	// SP redirects the user with a SAML request to this url
	callbackUrl: 'https://localhost:8888/acs',		// IDP will post SAML response here
	issuer: 'https://localhost:8888',	// the SP
	identifierFormat: null,	// SP requests this from the IDP but the option will be specified by the IDP
	decryptionPvk: fs.readFileSync(__dirname + '/certs/ASPSP_nonRepudiation.key', 'utf8'),	// decryptionKey.pem
	privateCert: fs.readFileSync(__dirname + '/certs/ASPSP_nonRepudiation.key', 'utf8'), // signingKey.pem
	validateInResponseTo: true,	// whether to validate SAML responses from the IDP
	disableRequestedAuthnContext: true
}, function(profile, done) {
	return done(null, profile);
});

passport.use('samlStrategy', samlStrategy);

app.use('/', router);

app.set('port', 8888);
const httpsOptions = {
  key: fs.readFileSync('./certs/ASPSP_authentication.key'),
  cert: fs.readFileSync('./certs/ASPSP_authentication.crt'),
  rejectUnauthorized: false
};

https.createServer(httpsOptions, app).listen(app.get('port'), function() {
    console.log('ASPSP webapp is running on port', app.get('port'));
});