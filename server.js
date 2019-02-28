const accountSid = 'ACe7faaeafde1aafc4c694f3b68c1035bc';
const authToken = 'fc81ae82e6c7469051947bc5c72a6225';
const client = require('twilio')(accountSid, authToken);
var payumoney = require('payumoney-node');
let MERCHANT_KEY="5jJbQJR3";
let MERCHANT_SALT ="xIAnuW1WTh";
let AUTHORIZATION_HEADER = "SNHz/vr+Dh+SmdrTEGDhF7DLSmpej6DiqQRNH9AdRow="
var request = require('request');

var nodemailer = require('nodemailer');
var path = require('path');
var bodyParser = require('body-parser');
var express = require('express');
var app = express();
var jsonxml = require('jsontoxml');
var fs = require('fs');
payumoney.setKeys(MERCHANT_KEY, MERCHANT_SALT, AUTHORIZATION_HEADER);
payumoney.isProdMode(false);

app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());
// define a route that will send email
   app.post('/send-email', function(req, res) {

   //Here you can access req parameter
      var body  = req.body;

      console.log(req.body.message);
       //WRITE HERE ALL CODE THAT IS RESPONSIBLE FOR SENDING EMAI
       const transporter = nodemailer.createTransport({
    host: 'smtp.ethereal.email',
    port: 587,
    auth: {
        user: 'pietro.hand27@ethereal.email',
        pass: 'CweD68jDktWrdH3jGg'
    }
});

       var mailOptions = {
       from: 'pietro.hand27@ethereal.email',
       to: 'sanath@gmail.com',
       subject: "HELLO",
       html: req.body.message,

       }

       transporter.sendMail(mailOptions, function(err, res){
       if(err){
           console.log('Mail not sent');
       } else {
           console.log('Mail sent');
       }

       });

});
//listen for SMS events
app.get('/SMS', function(req, res) {
  var name = req.param('name');
  var date = req.param('date');
  var amount = req.param('amount');
  var pno = req.param('pno');
  sendSMS(name,date,amount,pno);
});
function sendSMS(name,date,amount,pno){
let body = "Hello";
body = "Dear " + name + " Your outstanding amount is Rs " + amount + "and the due date was " + date + "Please pay back at the earliest to avoid further issues";
client.messages
      .create({from: '+15017122661', body: 'body', to: '+15558675310'})
      .then(message => console.log(message.sid));
}

//send whatsapp messages
app.get('/whatsapp', function(req, res) {
  var name = req.param('name');
  var date = req.param('date');
  var amount = req.param('amount');
  var pno = req.param('pno');
  sendWhatsapp(name,date,amount,pno);
});
function sendWhatsapp(name,date,amount,pno){
  var url = 'https://foo.chat-api.com/message?token=83763g87x';
  let body = "Hello";
  body = "Dear " + name + " Your outstanding amount is Rs " + amount + "and the due date was " + date + "Please pay back at the earliest to avoid further issues";

  var data = {
      phone: pno, // Receivers phone
      body: body, // Сообщение
  };
  // Send a request
  request({
      url: url,
      method: "POST",
      json: data
  });

}

//listen for call events
app.get('/makecall', function(req, res) {
  var name = req.param('name');
  var date = req.param('date');
  var amount = req.param('amount');
  var pno = req.param('pno');
  makeCall(name,date,amount,pno);
});

function makeCall(name,date,amount,pno){


  var xml = jsonxml({
      Response:[
          {name:'Say',attrs:'voice="alice"',text:name},
          {name:'Say',attrs:'voice="alice"',text:"your pending loan amount is Rupees"},

          {name:'Say',attrs:'voice="alice"',text:amount},{name:'Say',attrs:'voice="alice"',text:"and due date is"},
          {name:'Say',attrs:'voice="alice"',text:date},

      ],
  })

  fs.writeFile('temp.xml', xml, function(err, data){
      if (err) console.log(err);
      console.log("Successfully Written to File.");
  });

  console.log(xml);

  client.calls
        .create({
           url: 'https://sanathswaroop.com/call.xml',
           to: '+918790682297',
           from: '+919392848111'
         })
        .then(call => console.log(call.sid));
}


//Make payments
app.get('/payment', function(req, res) {
  let fname = req.param('fname');
  let lname = req.param('lname');
  let amount = req.param('amount');
  let email = req.param('email');
  let pno = req.param('pno');
  let info = req.param('linfo');
  let tid = req.param('tid');
  payumoney.isProdMode(true); // production = true, test = false
  var paymentData = {
      productinfo: info,
      txnid: tid,
      amount: amount,
      email: email,
      phone: pno,
      lastname: lname,
      firstname: fname,
      surl: "http://localhost:3000/payu/success", //"http://localhost:3000/payu/success"
      furl: "http://localhost:3000/payu/failure", //"http://localhost:3000/payu/fail"
  };
  console.log(paymentData)

  payumoney.makePayment(paymentData, function(error, response) {
    if (error) {
      // Some error
    } else {
      // Payment redirection link
      require("openurl").open(response)
      console.log(response);
    }
  });

});



// listen for all incoming requests
app.listen(3000, function(){
  console.log("Server is listening on port 3000");
});
