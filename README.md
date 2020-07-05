# SAML x509 authentication and Verifiable Credentials

## Dependencies

To be able to run this project you will need to install:
- a browser capable of loading certificates (Chrome, IE, Firefox, Safari)
- [NodeJs](https://nodejs.org/en/download/)


## Download

You can download `SAML x509 authentication flow` by cloning this git repository:

```
git clone ...
```


## Set-up

The following steps were tested on [linux mint](https://www.linuxmint.com/) 19.3 "Tricia" and 20 "Ulya" - Cinnamon (64-bit)

### install nodejs

```bash
sudo apt install nodejs
```

### add certificates to the browser


#### chromium

- Navigate to `chrome://settings/certificates` -- or manually go to the browser's `Settings` -> `Privacy and security` -> `More` -> `Manage Certificates`
- Under the `Your certificates` tab, click `Import`
- Select one of the `eID_*.p12` files available in the `cerfificates` folder.
- When prompted for a password, read it from the corresponding `eID_*.pass.p12` text file.

In Mint 20, chromium is not installed by default. You can install it via `sudo apt install chromium`.

#### firefox

- Navigate to `about:preferences#privacy`
- Scroll down to `Security` -> `Certificates`
- Click on `View Certificates`
- Under the `Your Certificates` tab, click `Import`
- Select one of the `eID_*.p12` files available in the `cerfificates` folder.
- When prompted for a password, read it from the corresponding `eID_*.pass.p12` text file.


### Service deployment

- IdP
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

