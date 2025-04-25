// **************************************************************  
// *** This is a simple Pet server written in pure Javascript ***
// *** (requires Node.js) by The Rickster to serve as a       ***
// *** working REST API prior to learning Express/MongoDB.    ***
// ***                                                        ***
// *** Runs on http://localhost:8000  (see consts below)      ***
// **************************************************************  

const hostname = "127.0.0.1";
const port = 8000;
const http = require("http");
const { getEnvironmentData } = require("worker_threads");

// ***********************************************************
// *** Pets is a plain Javascript map, initialized so that ***
// *** some data exists at the start.  Use MongoDB instead ***
// ***********************************************************

var Pets = new Map();
Pets.set("Barky", {species: "Dog", breed: "Labrador", age: 3 });
Pets.set("Meowy", {species: "Cat", breed: "Siamese", age: 1 });

// helper functions

function NotExists(name, res) {
  if (Pets.has(name)) return false;
  res.setHeader('Content-Type', 'application/json');
  res.statusCode = 404;   // not found
  res.write(`${name} not found\n`);
  return true;
}

// *****************************************************
// *** CRUD functions.  A request should land in one ***
// *** of these as determined by the method and URL  ***
// *****************************************************

function readall(res) {
  res.setHeader('Content-Type', 'application/json');
  res.statusCode = 200;   // ok
  res.write(JSON.stringify([...Pets.keys()]));
}

function readone(res, name) {
  if (NotExists(name, res)) return;
  res.setHeader('Content-Type', 'application/json');
  res.statusCode = 200;   // ok
  res.write(JSON.stringify(Pets.get(name)));
}

function createone(res, name, item) {
  if (Pets.has(name)) {
    res.setHeader('Content-Type', 'text/plain');
    res.statusCode = 400;   // bad request
    res.write(`${name} already exists`);
  } else {
    Pets.set(name, item);
    res.setHeader('Content-Type', 'text/plain');
    res.statusCode = 200;   // ok
    res.write(`${name} created`);
  }
}

function deleteone(res, name) {
  if (NotExists(name, res)) return;
  Pets.delete(name);
  res.setHeader('Content-Type', 'text/plain');
  res.statusCode = 200;   // ok
  res.write(`${name} deleted`);
}

function updateone(res, name, item) {
  if (NotExists(name, res)) return;
  const original = Pets.get(name);
  for (let prop in item) {
    original[prop] = item[prop];
  }
  res.setHeader('Content-Type', 'text/plain');
  res.statusCode = 200;   // ok
  res.write(`${name} updated`);
}

// *******************************************************
// *** HTTP method handlers.   Inspect the URL and     ***
// *** pass the request on to the right CRUD operation ***
// *******************************************************

function handle_get(req, res) {
  if (req.url === "/") { readall(res); return; }
  readone(res, req.url.substring(1));
}

function handle_post(req, res, body) {
  createone(res, req.url.substring(1), JSON.parse(body));
}

function handle_put(req, res, body) {
  updateone(res, req.url.substring(1), JSON.parse(body));
}

function handle_patch(req, res, body) {
  updateone(res, req.url.substring(1), JSON.parse(body));
}

function handle_delete(req, res) {
  deleteone(res, req.url.substring(1));
}

// ***************************************************** 
// *** main http request handler.  All requests will ***
// *** start here, and get sent to a specific        ***
// *** handler based on the http method              ***
// ***************************************************** 

function handle_req(req, res, body) {
  try {
    console.log(`handle_req ${req.method} request`);

    // Add CORS headers.  I hate CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,PUT,POST,PATCH,DELETE');

    if (req.method === "GET")    handle_get(req, res);
    if (req.method === "POST")   handle_post(req, res, body);
    if (req.method === "PUT")    handle_put(req, res, body);
    if (req.method === "PATCH")  handle_patch(req, res, body);
    if (req.method === "DELETE") handle_delete(req, res);
  } catch (error) {
    res.setHeader('Content-Type', 'text/plain');
    res.statusCode = 500;   // server error
    res.write(error.message);  // send only the error message string
  } finally {
    res.end();
  }
}

http.createServer((req, res) => {
  let bodyChunks = [];
  req.on('error', (err) => { console.error(err); });
  req.on('data', (chunk) => { bodyChunks.push(chunk); });
  req.on('end', () => {
    const body = Buffer.concat(bodyChunks).toString();
    handle_req(req, res, body);
  });
}).listen(port, hostname, () => {
  console.log(`PetRESTServer running at http://${hostname}:${port}/`);
});
