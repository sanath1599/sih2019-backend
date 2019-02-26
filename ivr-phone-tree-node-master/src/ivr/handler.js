const VoiceResponse = require('twilio').twiml.VoiceResponse;

exports.welcome = function welcome() {
  const voiceResponse = new VoiceResponse();

  const gather = voiceResponse.gather({
    action: '/ivr/menu',
    numDigits: '1',
    method: 'POST',
  });

  gather.say(
    'Thanks for calling Payment recovery services of M.S.M.E' +
    'Please press 1 for requesting an agent pickup ' +
    'Press 2 for talking to customer care executive.',
    {loop: 3}
  );

  return voiceResponse.toString();
};

exports.menu = function menu(digit) {
  const optionActions = {
    '1': giveExtractionPointInstructions,
    '2': listPlanets,
  };

  return (optionActions[digit])
    ? optionActions[digit]()
    : redirectWelcome();
};

exports.planets = function planets(digit) {
  const optionActions = {
    '2': '+918332981498',
    '3': '+918520959114',
    '4': '+919392848111',
  };

  if (optionActions[digit]) {
    const twiml = new VoiceResponse();
    twiml.dial(optionActions[digit]);
    return twiml.toString();
  }

  return redirectWelcome();
};

/**
 * Returns Twiml
 * @return {String}
 */
function giveExtractionPointInstructions() {
  const twiml = new VoiceResponse();

	twiml.say(
    'You request has been placed for an agent.' + 'We will be contacting you soon on this mobile number for confirmation.',
    {voice: 'alice', language: 'en-GB'}
  );
  mail("reguest agent pickup");

  twiml.say(
    'Thank you for calling Payment Recovery  Services of M.S.M.E'
  );


  twiml.hangup();

  return twiml.toString();
}

/**
 * Returns a TwiML to interact with the client
 * @return {String}
 */
function listPlanets() {
  const twiml = new VoiceResponse();

  const gather = twiml.gather({
    action: '/ivr/planets',
    numDigits: '1',
    method: 'POST',
  });

  gather.say(
    'To talk to Customer service executive, press 2. To call kaustubh ' +
    ', press 3. To call sanath swaroop, press 4. To ' +
    'go back to the main menu, press the star key ',
    {voice: 'alice', language: 'en-GB', loop: 3}
  );
  mail("customer service");

  return twiml.toString();
}
function mail(data)
{
//send mail on request
console.log(req.body.message);
       //WRITE HERE ALL CODE THAT IS RESPONSIBLE FOR SENDING EMAI
      const transporter = nodemailer.createTransport({
    host: 'smtp.ethereal.email',
    port: 587,
    auth: {
        user: 'audie.effertz59@ethereal.email',
        pass: '5UEyt8W5ftTDCyThXJ'
    }
});

       var mailOptions = {
       from: 'audie.effertz59@ethereal.email',
       to: 'sanath@gmail.com',
       subject: "HELLO",
       html: "Hey, you have received a request from 9392848111 for "+ data,

       }

       transporter.sendMail(mailOptions, function(err, res){
       if(err){
           console.log('Mail not sent');
       } else {
           console.log('Mail sent');
       }

       });
}

/**
 * Returns an xml with the redirect
 * @return {String}
 */
function redirectWelcome() {
  const twiml = new VoiceResponse();

  twiml.say('Returning to the main menu', {
    voice: 'alice',
    language: 'en-GB',
  });

  twiml.redirect('/ivr/welcome');


  return twiml.toString();
}
