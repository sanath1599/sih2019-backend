const accountSid = 'ACe7faaeafde1aafc4c694f3b68c1035bc';
const authToken = 'fc81ae82e6c7469051947bc5c72a6225';
const client = require('twilio')(accountSid, authToken);
var payumoney = require('payumoney-node');
let MERCHANT_KEY="5jJbQJR3";
let MERCHANT_SALT ="xIAnuW1WTh";
let AUTHORIZATION_HEADER = "SNHz/vr+Dh+SmdrTEGDhF7DLSmpej6DiqQRNH9AdRow="
var request = require('request');
let ngrok = "https://sanathswaroop.com"


var nodemailer = require('nodemailer');
var path = require('path');
var bodyParser = require('body-parser');
var express = require('express');
var app = express();
var cors = require('cors');
app.use(cors());
var jsonxml = require('jsontoxml');
var fs = require('fs');
payumoney.setKeys(MERCHANT_KEY, MERCHANT_SALT, AUTHORIZATION_HEADER);
payumoney.isProdMode(false);


app.use(bodyParser.json());
// define a route that will send email
   app.post('/send-email', function(req, res) {

   //Here you can access req parameter
      var body  = req.body;

      console.log(req.body.message);
       //WRITE HEREALL CODE THAT IS RESPONSIBLE FOR SENDING EMAI
       const transporter = nodemailer.createTransport({
    host: 'smtp.ethereal.email',
    port: 587,
    auth: {
        user: 'ford21@ethereal.email',
        pass: 'JWKbUa2GerSwY7x9nt'
    }
});
//        const transporter = nodemailer.createTransport({
//           host: 'codingstudio.club',
//           port: 465,
//           auth: {
//               user: 'payrec@codingstudio.club',
//               pass: 'payrecsih'
//           }
// });

       var mailOptions = {
       from: 'ford21@ethereal.email',
       to: 'sanath15swaroop@gmail.com',
       subject: "Notification from PayRec-MSME",
       html: "Dear Sanath Swaroop<br>You've received this mail as a remainder for your Due payment of <b>Rs 25,000</b> that needs to be done by <b>4th March</b>",

       }

       transporter.sendMail(mailOptions, function(err, res){
       if(err){
           console.log('Mail not sent');
           console.log(err);
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
  client.messages
    .create({
       body: 'Dear Sanath Swaroop, payment of Rs 25,000 Due on 4th march 2019',
       from: '+12513330297',
       to: '+918790682297'
     })
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

  let body = "Hello";
  body = "Dear " + name + " Your outstanding amount is Rs " + amount + "and the due date was " + date + "Please pay back at the earliest to avoid further issues";

request.post('https://www.waboxapp.com/api/send/chat', {
  json: {
    token: 'Buy the milk',
    uid: "919392848111",
    to:pno,
    custom_uid:Math.random(),
    text:body,

  }
}, (error, res, body) => {
  if (error) {
    console.error(error)
    return
  }
  console.log(`statusCode: ${res.statusCode}`)
  console.log(body)
})
  // var url = 'https://eu35.chat-api.com/instance28989/message?token=pjz6rl8nly72l7qx';

  // var data = {
  //     phone: pno, // Receivers phone
  //     body: body, // Сообщение
  };
  // Send a request
  // request({
  //     url: url,
  //     method: "POST",
  //     json: data
  // });



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
           url: ngrok + '/call.xml',
           to: '+919392848111',
           from: '+12513330297'
         })
        .then(call => console.log(call.sid));
};


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
      // fs.writeFile(tid + ".json", json, function(err, paymentData){
      //     if (err) console.log(err);
          console.log("Successfully Written to File.");
      });
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
