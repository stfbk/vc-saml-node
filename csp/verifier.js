const {extendContextLoader} = require('jsonld-signatures');
const vc = require('vc-js');
const {defaultDocumentLoader} = vc;
const fs = require( 'fs' );
const ec = new require('elliptic').ec('secp256k1');
const forge = require('node-forge');
const {util: {binary: {base58}}} = forge;
const Secp256k1KeyPair = require('secp256k1-key-pair');
const EcdsaSepc256k1Signature2019 = require('ecdsa-secp256k1-signature-2019');

//Import documents and contexts
const issuer = require('./credentials/did.json');
var bankingContext = require('./credentials/context-schema-degree');
var credentialTemplate = require('./credentials/credential-template');

const date = new Date();

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
			id: 'did:example:credential-issuer#key0',
			type: 'EcdsaSecp256k1VerificationKey2019',
			controller: 'did:example:credential-issuer',
			publicKeyBase58: 'jwUAVH4UAmpem7X1APjWAwCDMNvqMuYxfk9tcBsC8hqW'
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

function verifyIssuer() {
	//Should go the issuer URI and verify the presence of a certificate
	return true;
}

function verifySubjectID(credential, clientId) {
	if(clientId == credential.credentialSubject.clientId)
		return true;
	
	return false;
}

async function verifyVerifiableCredential(credential, clientId) {
	const verifySuite = new EcdsaSepc256k1Signature2019();
 
	if(verifySubjectID(credential, clientId) && verifyIssuer(credential)) {
		result = await vc.verifyCredential({credential, documentLoader, suite:verifySuite, controller:issuer});
		console.log(JSON.stringify(result, null, 2))
		
		return result.verified;
	}

	return false;
}

module.exports = {
	verifyVerifiableCredential
}