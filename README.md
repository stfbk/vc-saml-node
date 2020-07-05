# SAML x509 authentication and Verifiable Credentials

## Dependencies

To be able to run this project you will need to install:

- a browser capable of loading certificates (Chrome, IE, Firefox, Safari)
- [NodeJs](https://nodejs.org/en/download/) and node package manager (npm)
- sqlite3

## Set-up - linux

The following steps were tested on [linux mint](https://www.linuxmint.com/) 19.3 "Tricia" - Cinnamon (64-bit).

### Install requirements

```bash
sudo apt install nodejs npm sqlite3 git
git clone git@github.com:stfbk/vc-saml-node.git
```

### Add certificates to the browser

We have provided three eID certificates to test different cases:

1. `eID_IT_LNRMNA[etc]` has been enrolled at the ASPSP and should be able to complete the scenario successfully.
1. `eID_IT_GNTCSR[etc]` has an expired certificate and should not be able to successfully authenticate at the IDP.
1. `eID_IT_FRRFNC[etc]` has not been enrolled at the ASPSP and should not be granted a VC to download (may require browser restart after failed login, WIP)

Add the first certificate to your browser; two examples are provided.

#### chromium

1. Navigate to `chrome://settings/certificates` -- or manually go to the browser's `Settings` -> `Privacy and security` -> `More` -> `Manage Certificates`
1. Under the `Your certificates` tab, click `Import`
1. Select one of the `eID_*.p12` files available in the `cerfificates` folder.
1. When prompted for a password, read it from the corresponding `eID_*.p12.pass` text file.

#### firefox

1. Navigate to `about:preferences#privacy`
1. Scroll down to `Security` -> `Certificates`
1. Click on `View Certificates`
1. Under the `Your Certificates` tab, click `Import`
1. Select one of the `eID_*.p12` files available in the `cerfificates` folder.
1. When prompted for a password, read it from the corresponding `eID_*.p12.pass` text file.


### Service deployment

- IDP
  - Open a terminal and reach the folder `eidas-idp`
  - Run `npm install` and then `node app`


- ASPSP
  - Open a terminal and reach the folder `aspsp`
  - Run `npm install` and then `node app`


- CSP
  - Open a terminal and reach the folder `csp`
  - Run `npm install` and then `node app`


- OCSP server
  - Open a terminal and reach the folder `ocsp-server`
  - Run `npm install` and then `node app`


Visit `localhost:8888` to use ASPSP and `localhost:8889` to use CSP

## Onboarding and Verifiable Credential flow

After performing all the steps in Setup:

1. Obtain your Verifiable Credential from the ASPSP
    1. navigate to `localhost:8888` and select "Login with eIDAS"
    1. select "Allow" when redirected to the IDP verify the correctness of the information provided by the IDP and express consent to sharing it
    1. select "Download Verifiable Credential" after being redirected to the ASPSP

1. Present your Verifiable Credential to the CSP
    1. navigate to `localhost:8889` and select "Login with eIDAS"
    1. select "Allow" when redirected to the IDP verify the correctness of the information provided by the IDP and express consent to sharing it

### Notes

- The first time you visit the provided `localhost` services, you will be prompted to accept the risk of visiting a site with an untrusted CA.

- After logging in with one of the provided certificates, you may need to restart your browser to attempt the flow with a different one.

- The ASPSP uses an sqlite3 db to manage onboarded users. This is not a fully developed feature. Users can be added or deleted at the following endpoints:
  - adding an account holder:

    `https://localhost:8888/createClient?clientId=<personal_identifier>&clientIban=<IBAN>`
  - deleting an account holder:

    `https://localhost:8888/deleteClient?clientId=<personal_identifier>`

- VCs are saved as plain `.json` files to the local drive. A credential management client is not the focus of this proof of concept.

## License
Copyright 2020, Fondazione Bruno Kessler

Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at

```
http://www.apache.org/licenses/LICENSE-2.0
```

Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.

Developed within [Security & Trust](https://stfbk.github.io/) Research Unit at [Fondazione Bruno Kessler](https://www.fbk.eu/en/) (Italy)
