const {extendContextLoader} = require('jsonld-signatures');
const vc = require('vc-js');
const {defaultDocumentLoader} = vc;
const fs = require( 'fs' );
const ec = new require('elliptic').ec('secp256k1');
const forge = require('node-forge');
const util = require('util');
const exec = util.promisify(require('child_process').exec);
const {util: {binary: {base58}}} = forge;
const Secp256k1KeyPair = require('secp256k1-key-pair');
const EcdsaSepc256k1Signature2019 = require('ecdsa-secp256k1-signature-2019');

//Import documents and contexts
const issuer = require('./credentials/did.json');
var bankingContext = require('./credentials/context-schema-degree');
var credentialTemplate = require('./credentials/credential-template');

const date = new Date();

async function fetchPrivateKeyIssuer() {
	//TODO get private key from pem file
	// Get PrivK from non-rcd
	var privateKeyByte = fs.readFileSync('./keys/private.txt');
	const {stdout, stderr} = await exec('openssl ec -in tmp_private.txt -outform DER|tail -c +8|head -c 32|xxd -p -c 32');
	console.log(stdout);
	key = ec.keyFromPrivate(stdout,'hex');
    const privateKeyBase58 = base58.encode(new Uint8Array(
		key.getPrivate().toArray()));

	console.log(privateKeyBase58);
	return privateKeyBase58;
}

async function fetchPublicKeyIssuerBase58() {
	var privateKeyByte = fs.readFileSync('./keys/public.txt');
	const {stdout, stderr} = await exec('openssl ec -in tmp_private.txt -pubout -outform DER|tail -c 65|xxd -p -c 65');
	
	console.log(stdout);
	key = ec.keyFromPublic(stdout,'hex');
	const pubPoint = key.getPublic();
    const publicKeyBase58 = base58.encode(new Uint8Array(
	  pubPoint.encodeCompressed()));
	  
	console.log(publicKeyBase58);
	return publicKeyBase58;
}

var issuer_suite = null;

//Create issuer Secp256k1KeyPair for issuing verifiable credentials
async function createSuite() {
	privateKeyBase58 = await fetchPrivateKeyIssuer();
	publicKeyBase58 = await fetchPublicKeyIssuerBase58();

	var issuer_suite = new EcdsaSepc256k1Signature2019({
		key: new Secp256k1KeyPair(
			{
			id: issuer.publicKey[0].id,
			privateKeyBase58: '5d15bfa5deaf48e67fa547ac8ad559a6c6f755867b1bdd82dc35c5697eab631e',
			publicKeyBase58: issuer.publicKey[0].publicKeyBase58
			})
	  });  
}

createSuite();

const documentLoader = extendContextLoader(async url => {
	if(url === 'http://localhost:8080/degreeCredentialContext/v1') {
		return {
			contextUrl: null,
			documentUrl: url,
			document: bankingContext
		};
	}

	if(url === 'did:example:credential-issuer') {
		return {
			contextUrl: null,
			documentUrl: url,
			document: issuer
		};
	}

	//Create public material key from the DID
	if(url.startsWith('did:example:') && url.includes('#key')) {
		//TODO: Fetch information directly from the issuer DID instead of manually building it
		
		doc = {
			id: issuer.publicKey[0].id,
			type: issuer.publicKey[0].type,
			controller: issuer.publicKey[0].controller,
			publicKeyBase58: issuer.publicKey[0].publicKeyBase58
		}
		doc['@context'] = 'https://w3id.org/security/v2';
		return {
		  contextUrl: null,
		  documentUrl: url,
		  document: doc
		};
	  }

	return defaultDocumentLoader(url);
  });

function verifyBankingInformation(bankingInformation) {

	return true;
}

function buildCredential(bankingInformation) {
	if(!verifyBankingInformation(bankingInformation))
		throw Error("Verification of the client information failed")
		
	var credential = credentialTemplate;

	credential.issuer = issuer.id

    console.log("Banking Information", bankingInformation)
	//Client information
	credential.credentialSubject.clientId = bankingInformation.id;
	credential.credentialSubject.iban = bankingInformation.iban;

    console.log(credential)
	return credential;
}

async function generateVerifiableCredential(bankingInformation) {
	var credential = buildCredential(bankingInformation);
	console.log(credential)
	const signedVC = await vc.issue({credential, suite:issuer_suite, documentLoader});
	console.log(JSON.stringify(signedVC, null, 2));
	const verifySuite = new EcdsaSepc256k1Signature2019();
	result = await vc.verifyCredential({credential:signedVC, documentLoader, suite:verifySuite, controller:issuer});
	console.log(JSON.stringify(result, null, 2))

	if(result.verified == false)
		throw Error("Issued credential failed to be verified");

	return signedVC
}

module.exports = {
	generateVerifiableCredential
}