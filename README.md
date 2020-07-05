# SAML x509 authentication and Verifiable Credentials

## Dependencies

To be able to run this project you will need to install:
- a browser capable of loading certificates (Chrome, IE, Firefox, Safari)
- [NodeJs](https://nodejs.org/en/download/) and node package manager (npm)
- sqlite3

## Download

You can download `SAML x509 authentication flow` by cloning this git repository:

```bash
git clone ...
```


## Set-up - linux

The following steps were tested on [linux mint](https://www.linuxmint.com/) 19.3 "Tricia" - Cinnamon (64-bit).

### Install requirements

```bash
sudo apt install nodejs npm sqlite3
```

### Add certificates to the browser

We have provided three eID certificates to test different cases:

- `eID_IT_LNRMNA[etc]` has been enrolled at the ASPSP and should be able to complete the scenario successfully.
- `eID_IT_GNTCSR[etc]` has an expired certificate and should not be able to successfully authenticate at the IDP.
- `eID_IT_FRRFNC[etc]` has not been enrolled at the ASPSP and should not be granted a VC to download (may require browser restart after failed login, WIP)

Add the first certificate to your browser; two examples are provided.

#### chromium

- Navigate to `chrome://settings/certificates` -- or manually go to the browser's `Settings` -> `Privacy and security` -> `More` -> `Manage Certificates`
- Under the `Your certificates` tab, click `Import`
- Select one of the `eID_*.p12` files available in the `cerfificates` folder.
- When prompted for a password, read it from the corresponding `eID_*.p12.pass` text file.

#### firefox

- Navigate to `about:preferences#privacy`
- Scroll down to `Security` -> `Certificates`
- Click on `View Certificates`
- Under the `Your Certificates` tab, click `Import`
- Select one of the `eID_*.p12` files available in the `cerfificates` folder.
- When prompted for a password, read it from the corresponding `eID_*.p12.pass` text file.


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

- Obtain your Verifiable Credential from the ASPSP
-- navigate to `localhost:8888` and select "Login with eIDAS"
-- select "Allow" when redirected to the IDP verify the correctness of the information provided by the IDP and express consent to sharing it
-- select "Download Verifiable Credential" after being redirected to the ASPSP
- Present your Verifiable Credential to the CSP
-- navigate to `localhost:8889` and select "Login with eIDAS"
-- select "Allow" when redirected to the IDP verify the correctness of the information provided by the IDP and express consent to sharing it

### Notes

The first time you visit the provided `localhost` services, you will be prompted to accept the risk of visiting a site with an untrusted CA.

After logging in with one of the provided certificates, you may need to restart your browser to attempt the flow with a different one.

The ASPSP uses an sqlite3 db to manage onboarded users. This is not a fully developed feature. Users can be added or deleted at the following endpoints:

- adding an account holder: `https://localhost:8888/createClient?clientId=<personal_identifier>&clientIban=<IBAN>`
- deleting an account holder: `https://localhost:8888/deleteClient?clientId=<personal_identifier>`

