
/**
 * User Profile
 */
var profile = {
  nameIdFormat: 'urn:oasis:names:tc:SAML:2.0:nameid-format:transient',
  name: 'Kevin',
  familyName: 'Mitnick',
  dateOfBirth: '1963-08-06',
  fiscalNumber: 'MTNKVN63M06L378D',
}

/**
 * SAML Attribute Metadata
 */
var metadata = [{
  id: "name",
  optional: false,
  displayName: 'Nome',
  description: 'The given name of the user',
  multiValue: false
},{
  id: "familyName",
  optional: false,
  displayName: 'Cognome',
  description: 'The surname of the user',
  multiValue: false
}, {
  id: "dateOfBirth",
  optional: false,
  displayName: 'Data di Nascita',
  description: 'The date of birth',
  multiValue: false
},{
  id: "fiscalNumber",
  optional: false,
  displayName: 'Codice fiscale',
  description: 'Social Security Number',
  multiValue: false
}];

module.exports = {
  user: profile,
  metadata: metadata
}
