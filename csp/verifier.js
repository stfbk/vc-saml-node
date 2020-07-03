const {extendContextLoader} = require('jsonld-signatures');
const vc = require('vc-js');
const {defaultDocumentLoader} = vc;
const fs = require( 'fs' );
const ec = new require('elliptic').ec('secp256k1');
const forge = require('node-forge');
const request = require("request-promise");
const {util: {binary: {base58}}} = forge;
const EcdsaSepc256k1Signature2019 = require('ecdsa-secp256k1-signature-2019');

//Import documents and contexts
var bankingContext = require('./credentials/context-schema-degree');
var issuer = null;
const documentLoader = extendContextLoader(async url => {
	if(url === 'http://localhost:8080/degreeCredentialContext/v1') {
		return {
			contextUrl: null,
			documentUrl: url,
			document: bankingContext
		};
	}

	//Create public material key from the DID
	if(url.startsWith('key:example:') && url.includes('#key')) {
		doc = {
			id: issuer.publicKey[0].id,
			type: issuer.publicKey[0].type,
			controller: issuer.id,
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

function verifySubjectID(credential, clientId) {
	if(clientId != credential.credentialSubject.clientId)
		throw new Error("Client ID doesn't correspond to the ID on the credential" + clientId + credential.credentialSubject.clientId);
	
	return true;
}

async function getControllerDocument(issuer) {
	console.log('---- Getting Issuer ----')

	return await request({
		method: "GET",
		uri: issuer,
		headers: {
		  "Content-Type": "application/json"
		},
		agentOptions: {
		  ca: fs.readFileSync("../certificates/CA_IT.crt")
		}
	  }, function(error, httpResponse, body) {
		  return body;
	  });
};


async function verifyVerifiableCredential(credential, clientId) {

	var responseBody = await getControllerDocument(credential.issuer)

	issuer = JSON.parse(responseBody);

	const verifySuite = new EcdsaSepc256k1Signature2019();
	console.log("----- Verifying Verifiable Credential ------");
	if(verifySubjectID(credential, clientId)) {
		console.log("------- Client verified -------")
		result = await vc.verifyCredential({credential, documentLoader, suite:verifySuite, controller:issuer});
		console.log(JSON.stringify(result, null, 2))
		return result.verified;
	}

	return false;
}

module.exports = {
	verifyVerifiableCredential
}