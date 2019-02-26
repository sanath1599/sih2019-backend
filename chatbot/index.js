require('dotenv').config({ path: 'variables.env' });
const express = require('express');
const bodyParser = require('body-parser');
const app = express();
// const messageWebhook = require('./message-webhook');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.listen(5000, () => console.log('Webhook server is listening, port 5000'));

const verifyWebhook = require('./src/verify-webhook');

app.get('/', verifyWebhook);
const messageWebhook = require('./src/message-webhook');

app.post('/', messageWebhook);