# SAML x509 authentication flow

### Dependencies

To be able to run this project you will need to install:
- [Burp](https://portswigger.net/burp/communitydownload)
- a browser (Chrome, IE, Firefox, Safari)
- [NodeJs](https://nodejs.org/en/download/)


### Download

You can download `SAML x509 authentication flow` by cloning this git repository:

```
git clone ...
```


### Usage

###### Burp configuration

- Start Burp
- Setup your browser to use Burp as proxy ([Chrome](https://portswigger.net/support/configuring-chrome-to-work-with-burp), [IE](https://portswigger.net/support/configuring-internet-explorer-to-work-with-burp), [Firefox](https://portswigger.net/support/configuring-firefox-to-work-with-burp), [Safari](https://portswigger.net/support/configuring-safari-to-work-with-burp))
- Add `*.p12` certificate files available in the `cerfificates` folder to Burp under `User options` -> `TLS` -> `Client TLS Certificates`. Password is `gelato`

###### Service deployment

- IdP
  - Open a terminal and reach the folder `eidas-idp`
  - Run `npm install` and then `node app`


- ASPSP
  - Open a terminal and reach the folder `aspsp`
  - Run `npm install` and then `node app`


- ASPSP
  - Open a terminal and reach the folder `csp`
  - Run `npm install` and then `node app`


- OCSP server
  - Open a terminal and reach the folder `ocsp-server`
  - Run `npm install` and then `node app`


Visit `localhost:8888` to use ASPSP and `localhost:8889` to use CSP
