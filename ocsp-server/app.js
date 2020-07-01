const express = require('express');
const bodyParser = require('body-parser');
const https = require('https');
const fs = require('fs');



const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const revokedList = ['7B8FCED106E932EE43D20FC4DDC3DB0704A894BD'];

const router = express.Router();
router.post('/verify', (request, response) => {
  if(request.body.serialNumber){
    if(revokedList.includes(request.body.serialNumber))
      response.json({status: "revoked"});
    else
      response.json({status: "good"});
  }
  else
    response.json({status: "unknown"});
});

app.use('/', router);

app.set('port', 9000);


const httpsOptions = {
  key: fs.readFileSync('./certs/VA_IT_authentication.key'),
  cert: fs.readFileSync('./certs/VA_IT_authentication.crt'),
  rejectUnauthorized: false
};

https.createServer(httpsOptions, app).listen(app.get('port'), function() {
    console.log('OCSP webapp is running on port', app.get('port'));
});
