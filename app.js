// Environment Variables
const express = require('express');
const PORT = 8080;
const app = express();
const cors = require('cors');
app.use(cors());    // auto send Access-Control-Allow-Origin: * 
app.use(express.static(__dirname));// ensure page and API share the same origin(no fetch block)
app.use( express.json() );

// API Server's base URL
const API_BASE = 'http://127.0.0.1:8000'

// function: GET /pets
// description: retrieve all pets
// example: 'GET http://localhost:8080/pets'
app.get('/pets', async(req,res) => {

    try{
        //fetch RESTful API base
        const apiRes = await fetch(`${API_BASE}/`);

        //convert api response to json
        const petNames = await apiRes.json();
        res.json(petNames);

    } catch (err) {
        res.status(500).send('Error (GET /pets)');
    }

});





// function: GET /pets/:name
// description: retrieve a pets info by name
// example: 'GET http://localhost:8080/pets/Barky'
app.get('/pets/:name', async (req,res) => {
    const { name } = req.params;    // save the recieved requests parameters

    try{
        // send percent-encoded command and await response from RESTful API
        const apiRes = await fetch(`${API_BASE}/${encodeURIComponent(name)}`);

        // error test api response
        if( !apiRes.ok ){
            const message = await apiRes.text();
            return res.status(apiRes.status).send(message);
        }
        //api success

        const pet = await apiRes.json();
        res.json(pet);
    } catch (err) {
        res.status(501).send(`Error fetching ${name}: ${err.message}`)
    }

});




// function: DELETE /pets/:name
// description: adopt (delete) a pet
// example: 'DELETE http://localhost:8080/pets/Barky'
app.delete('/pets/:name', async (req,res) => { 
    const { name } = req.params;    // save the recieved requests parameters

    try {
        
        // send percent-encoded command and await response from RESTful API
        const apiRes = await fetch(`${API_BASE}/${encodeURIComponent(name)}`, {
            method: 'DELETE'
          });
        // set the response status message
        const message = await apiRes.text();
        res.status(apiRes.status).send(message);

    } catch (err) {
        res.status(502).send(`Error deleting ${name}: ${err.message}`);
    }

});





// function: POST /pets/:name/:breed/:age
// description: add a new pet for adoption
// example: 'POST /pets/Foo/German%20Shephard/6'
app.post('/pets/:name/:breed/:age', async (req, res) => { 
    // save the recieved request's parameters
    const { name, breed, age } = req.params;
    const petInfo = {
        breed: decodeURIComponent(breed),
        age: Number(age)
      };


    try{
        // send percent-encoded command and await response from RESTful API
        const apiRes = await fetch(`${API_BASE}/${encodeURIComponent(name)}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(petInfo)
        });
        // set the response status message
        const msg = await apiRes.text();
        res.status(apiRes.status).send(msg);

    } catch (err) {
        res.status(500).send(`Error: POST /pets/:${name} ...\n ${err.message}`);
    }

});





// function: PUT /pets/:name/:breed/:age
// description: modifies a pet's details, excluding name, via path parameters.
//      Note: Requires all arguments.
// example: 'PUT http://localhost:8080/pets/Barky/Golden%20Retriever/3'
app.put('/pets/:name/:breed/:age', async (req,res) => { 
    const { name, breed, age } = req.params;
    const updates = { breed, age: Number(age) };

    try{
    // send percent-encoded command and await response from RESTful API
    const apiRes = await fetch(`http://127.0.0.1:8000/${encodeURIComponent(name)}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });
      const msg = await apiRes.text();
      res.status(apiRes.status).send(msg);
    } catch (err) {
      res.status(500).send(err.message);
    }

});




// app.js begins by listening before handling responses
app.listen(
    PORT,
    () => console.log(`app.js is listening on http://localhost:${PORT}`)
)

