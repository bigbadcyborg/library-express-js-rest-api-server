// libraryrestserver.js
// pure node.js http server implementing a library books REST API

const http = require('http');
const url = require('url');

const hostname = '127.0.0.1';
const port = 3030;

// in-memory book inventory initialized with sample data
const Books = new Map([
  ['1', { id: '1', title: 'Reactions in REACT', author: 'Ben Dover', publisher: 'Random House', isbn: '978-3-16-148410-0', avail: true,  who: '',    due: '' }],
  ['2', { id: '2', title: 'Express-sions',       author: 'Frieda Livery', publisher: 'Chaotic House', isbn: '978-3-16-148410-2', avail: true,  who: '',    due: '' }],
  ['3', { id: '3', title: 'Restful REST',        author: 'Al Gorithm',   publisher: 'ACM',            isbn: '978-3-16-143310-1', avail: true,  who: '',    due: '' }],
  ['4', { id: '4', title: 'See Essess',          author: 'Anna Log',     publisher: "O'Reilly",      isbn: '987-6-54-148220-1', avail: false, who: 'Homer', due: '1/1/23' }],
  ['5', { id: '5', title: 'Scripting in JS',     author: 'Dee Gital',    publisher: 'IEEE',           isbn: '987-6-54-321123-1', avail: false, who: 'Marge', due: '1/2/23' }],
  ['6', { id: '6', title: 'Be An HTML Hero',     author: 'Jen Neric',    publisher: 'Coders-R-Us',    isbn: '987-6-54-321123-2', avail: false, who: 'Lisa',  due: '1/3/23' }]
]);


// set cors headers on every response to allow cross-origin requests from browsers
function setCors(res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
}


// helper to send a json response with specified status code and object payload
function sendJson(res, statusCode, payload) {
  res.writeHead(statusCode, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify(payload));
}


// helper to send a plain text response with specified status code and message
function sendText(res, statusCode, message) {
  res.writeHead(statusCode, { 'Content-Type': 'text/plain' });
  res.end(message);
}


// create the http server and define request handling logic
const server = http.createServer((req, res) => {
  // apply cors configuration to every response
  setCors(res);

  // parse the request url to extract pathname and query parameters
  const parsedUrl = url.parse(req.url, true);
  const { pathname, query } = parsedUrl;

  // split the url path into segments (e.g., ['books', '1'])
  const parts = pathname.split('/').filter(Boolean);

  // handle cors preflight requests by responding immediately
  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    return res.end();
  }

  // ensure all valid routes begin with /books
  if (parts[0] !== 'books') {
    return sendText(res, 404, 'not found');
  }

  // handle GET requests for listing or fetching book details
  if (req.method === 'GET') {
    // GET /books with optional ?avail=true or ?avail=false filter
    if (parts.length === 1) {
      let list = Array.from(Books.values());
      if (query.avail === 'true')      list = list.filter(b => b.avail);
      else if (query.avail === 'false') list = list.filter(b => !b.avail);

      // return only id and title for each book in the list
      const result = list.map(b => ({ id: b.id, title: b.title }));
      return sendJson(res, 200, result);
    }

    // GET /books/:id to fetch full details of a single book
    if (parts.length === 2) {
      const id = parts[1];
      if (!Books.has(id)) {
        return sendText(res, 404, 'book not found');
      }
      return sendJson(res, 200, Books.get(id));
    }
  }

  // handle POST /books to create a new book record
  if (req.method === 'POST' && parts.length === 1) {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', () => {
      try {
        const book = JSON.parse(body);
        const { id } = book;
        if (!id) return sendText(res, 400, 'missing id');
        if (Books.has(id)) return sendText(res, 403, 'book already exists');

        // add new book to inventory
        Books.set(id, book);
        return sendText(res, 201, 'book created');
      } catch (e) {
        return sendText(res, 400, 'invalid json');
      }
    });
    return;
  }

  // handle PUT /books/:id to update properties of an existing book
  if (req.method === 'PUT' && parts.length === 2) {
    const id = parts[1];
    if (!Books.has(id)) {
      return sendText(res, 404, 'book not found');
    }
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', () => {
      try {
        const updates = JSON.parse(body);
        const book = Books.get(id);
        // merge updates into existing book object
        Object.assign(book, updates);
        return sendText(res, 200, 'book updated');
      } catch (e) {
        return sendText(res, 400, 'invalid json');
      }
    });
    return;
  }

  // handle DELETE /books/:id to remove a book from inventory
  if (req.method === 'DELETE' && parts.length === 2) {
    const id = parts[1];
    if (!Books.has(id)) {
      // respond with no content when trying to delete nonexistent record
      return sendText(res, 204, '');
    }
    // remove book entry
    Books.delete(id);
    return sendText(res, 200, 'book deleted');
  }

  // respond with method not allowed for any other cases
  sendText(res, 405, 'method not allowed');
});



// start listening on configured hostname and port\ nserver.listen(port, hostname, () => {
console.log(`libraryrestserver running at http://${hostname}:${port}/`);

