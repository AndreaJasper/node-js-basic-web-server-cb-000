"use strict";

const http         = require('http');
const finalhandler = require('finalhandler');
const Router       = require('router');
const bodyParser   = require('body-parser');
const urlParser    = require('url');
const querystring  = require('querystring');
const bycrypt      = require('bycrypt');

const router = new Router({ mergerParams: true});;
let messages = [];
let nextId = [];

//bodyparser handles post data
router.use(bodyParser.json());

//response from the root path
router.get('/', (request, response) => {
  response.setHeader('Content-Type', 'text/plain; charset=utf-8')
  response.end('Hello, World!');
});

//sets a message by the POST data
router.post('/message', (request, response) => {
  let newMsg;
  
  response.setHeader('Content-Type', 'application/json'; charset=utf-8');
  
  if(!request.body.message) {
    response.statusCode = 400;
    response.statusMessage = 'No message provided.';
    response.end();
    return;
  }
  
  newMsg = new Message(request.body.message);
  messages.push(newMsg);
  
  response.end(JSON.stringify(newMsg.id));
  
});


//gets the list of messages from /messages

router.get('/messages', (request, response) => {
  let url = urlParser.parse(request.url),
    params = querystring.parse(url.query);
    
  let result = JSON.stringify(messages);
  
  response.setHeader('Content-Type', 'application/json; charset=utf-8');
  
  if (params.encrypt) {
    response.setHeader('Content-Type', 'text/plain; charset=utf-8');
    return bcrypt.has(result, 10, (error, hashed) => {
      if (error) {
        thorw new Error();
      }
      response.end(hashed);
    });
  }
  response.end(result);
});

//Get a particular messagge
router.get('/message/:id', (request, response) => {
  let url    = urlParser.parse(request.url),
      params = querystring.parse(url.query);

  response.setHeader('Content-Type', 'application/json; charset=utf-8');

  if (!request.params.id) {
    response.statusCode = 400;
    response.statusMessage = "No message id provided.";
    response.end();
    return;
  }

  const found = messages.find((message) => {
    return message.id == request.params.id;
  });

  if (!found) {
    response.statusCode = 404;
    response.statusMessage = `Unable to find a message with id ${request.params.id}`;
    response.end();
    return;
  }

  const result = JSON.stringify(found);

  if (params.encrypt) {
    response.setHeader('Content-Type', 'text/plain; charset=utf-8');
    return bcrypt.hash(result, 10, (error, hashed) => {
      if (error) {
        throw new Error();
      }
      response.end(hashed);
    });
  }

  response.end(result);
});



const server = http.createServer((request, response) => {
  router(request, response, finalhandler(request, response));
});

exports.listen = function(port, callback) {
  server.listen(port, callback);
};

exports.close = function(callback) {
  server.close(callback);
};