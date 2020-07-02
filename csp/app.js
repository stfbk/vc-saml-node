// server
const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const path = require('path');
var multer  = require('multer');


// SAML
const passport = require('passport');
const saml = require('passport-saml');

const https = require('https');
const fs = require('fs');

//JS Import
const verifier = require('./verifier.js');
//TODO
var upload = multer({ dest: './public/data/uploads/' });

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
		res.render('login');
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
		console.log('-----------------------------');
		console.log('login call back dumps');
		console.log(req.user);
		console.log('-----------------------------');
		res.render('home', req.user)
	}
);

router.get('/metadata',
	function(req, res) {
		res.type('application/xml');
		res.status(200).send(
			samlStrategy.generateServiceProviderMetadata(
			 fs.readFileSync(__dirname + '/certs/CSP_nonRepudiation.crt', 'utf8'),	// decryptionCert.pem
			 fs.readFileSync(__dirname + '/certs/CSP_nonRepudiation.crt', 'utf8')		// signingCert.pem
			)
		);
	}
);

router.post('/uploadVerifiableCredential', upload.single('file'), function(req, res) {
	console.log(req.body)
	var verifiableCredential = JSON.parse(fs.readFileSync(req.file.path));

	verifier.verifyVerifiableCredential(verifiableCredential, req.user.fiscalNumber) ? res.sendStatus(200) : res.sendStatus(500);
})


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
	callbackUrl: 'https://localhost:8889/acs',		// IDP will post SAML response here
	issuer: 'https://localhost:8889',	// the SP
	identifierFormat: null,	// SP requests this from the IDP but the option will be specified by the IDP
	decryptionPvk: fs.readFileSync(__dirname + '/certs/CSP_nonRepudiation.key', 'utf8'),	// decryptionKey.pem
	privateCert: fs.readFileSync(__dirname + '/certs/CSP_nonRepudiation.key', 'utf8'), // signingKey.pem
	validateInResponseTo: false,	// whether to validate SAML responses from the IDP
	disableRequestedAuthnContext: true
}, function(profile, done) {
	return done(null, profile);
});

passport.use('samlStrategy', samlStrategy);

app.use('/', router);

app.set('port', 8889);
const httpsOptions = {
  key: fs.readFileSync('./certs/CSP_authentication.key'),
  cert: fs.readFileSync('./certs/CSP_authentication.crt'),
  rejectUnauthorized: false
};

https.createServer(httpsOptions, app).listen(app.get('port'), function() {
    console.log('CSP webapp is running on port', app.get('port'));
});
