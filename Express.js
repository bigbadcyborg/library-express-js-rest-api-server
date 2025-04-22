// Express.js
// Author: Russell Sullivan
// Description: Express.js REST API for tracking library books 
// Date Last Modified: 4/22/2025

const express = require('express');
const app = express();
const PORT = 3000;

app.use(express.json()); // middleware to parse JSON bodies

// CORS handler allowing fetch calls from other origins
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,PATCH,DELETE,OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Content-Length, X-Requested-With');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

// in-memory storage of books, keyed by id
let books = {
  '1': { id: '1', title: 'Reactions in REACT', author: 'Ben Dover', publisher: 'Random House', isbn: '978-3-16-148410-0', avail: true,  who: null, due: null },
  '2': { id: '2', title: 'Express-sions',   author: 'Frieda Livery', publisher: 'Chaotic House',  isbn: '978-3-16-148410-2', avail: true,  who: null, due: null },
  '3': { id: '3', title: 'Restful REST',     author: 'Al Gorithm',   publisher: 'ACM',             isbn: '978-3-16-143310-1', avail: true,  who: null, due: null },
  '4': { id: '4', title: 'See Essess',       author: 'Anna Log',     publisher: "O'Reilly",      isbn: '987-6-54-148220-1',   avail: false, who: 'Homer', due: '1/1/23' },
  '5': { id: '5', title: 'Scripting in JS',  author: 'Dee Gital',    publisher: 'IEEE',           isbn: '987-6-54-321123-1',   avail: false, who: 'Marge', due: '1/2/23' },
  '6': { id: '6', title: 'Be An HTML Hero',  author: 'Jen Neric',    publisher: 'Coders-R-Us',    isbn: '987-6-54-321123-2',   avail: false, who: 'Lisa',  due: '1/3/23' }
};

// helper to list summary (id and title)
function summarize(list) {
  return list.map(book => ({ id: book.id, title: book.title }));
}



// ╔══════════════════════════════════════════════════════╗
// ║    GET /books?avail=[true|false] or GET /books       ║
// ╚══════════════════════════════════════════════════════╝
app.get('/books', (req, res) => {
  const { avail } = req.query;
  let result = Object.values(books);
  if (avail === 'true' || avail === 'false') {
    const flag = avail === 'true';
    result = result.filter(b => b.avail === flag);
  }
  return res.status(200).json(summarize(result));
});



// ╔══════════════════════════════════════════════════════╗
// ║                 GET /books/:id                       ║
// ╚══════════════════════════════════════════════════════╝
app.get('/books/:id', (req, res) => {
  const book = books[req.params.id];
  if (!book) {
    return res.status(404).json({ error: 'Book not found' });
  }
  return res.status(200).json(book);
});



// ╔══════════════════════════════════════════════════════╗
// ║   POST /books/:id/:title/:author:/:publisher/:isbn   ║
// ╚══════════════════════════════════════════════════════╝
// description: explicitly builds Book structure and force availability of the book to be true.
//    note: all arguments required or else a 404 will be thrown.
app.post('/books/:id/:title/:author/:publisher/:isbn', (req, res) => {
    const { id, title, author, publisher, isbn } = req.params;

    if (!id) {
      return res.status(400).json({ error: 'Missing id in URL' });
    }
    if (books[id]) {
      return res.status(403).json({ error: `Book with id ${id} already exists` });
    }

    // build the book record explicitly, forcing avail=true
    const newBook = {
      id,
      title,
      author,
      publisher,
      isbn,
      avail: true,
      who: null,
      due: null
    };

    books[id] = newBook;
    return res.status(201).json({ message: `Book ${id} created`, book: newBook });
  }
);



// ╔══════════════════════════════════════════════════════╗
// ║              PUT /books/:id?var=X                    ║
// ╚══════════════════════════════════════════════════════╝
// description:
//     allows for [validated] queries too each book id directory to change each attribute. for example:
//    		'PUT /books/:id?avail=true|false' flips the book to that availability
//		- also takes JSON body : { "title": , "author": , "publisher": , "isbn": , "who": , "due":  }
//   err if var is not an attribute
// returns: if fail, 404 & err message
//			if success, 200 & success message + the JSON Book object
app.put('/books/:id', (req, res) => {
	const { id } = req.params;
	const book = books[id];
	if (!book)
		return res.status(404).json( { error: 'Book not found' } );
	
	// validate query key
    const allowed = ['avail','title','author','publisher','isbn','who','due'];
    const keys = Object.keys(req.query); //req.query is an object representing everything after the ? in your URL.
	// find any query params that arent in the allowed field list
    const invalid = keys.filter(k => !allowed.includes(k)); 
    if (invalid.length) { // err check
		return res.status(400)
				  .json({ error: `Invalid query field${invalid.length > 1 ? 's' : ''}: ${invalid.join(', ')}` });
    }
	
	// handle query
	if (req.query.avail !== undefined) {
	  book.avail = req.query.avail === 'true';
	  return res.status(200).json({ message: `Book ${id} updated`, book });
	} else if (req.query.title !== undefined) {
	  book.title = req.query.title;
	  return res.status(200).json({ message: `Book ${id} updated`, book });
	} else if (req.query.author !== undefined) {
	  book.author = req.query.author;
	  return res.status(200).json({ message: `Book ${id} updated`, book });
	} else if (req.query.publisher !== undefined) {
	  book.publisher = req.query.publisher;
	  return res.status(200).json({ message: `Book ${id} updated`, book });
	} else if (req.query.isbn !== undefined) {
	  book.isbn = req.query.isbn;
	  return res.status(200).json({ message: `Book ${id} updated`, book });
	} else if (req.query.who !== undefined) {
	  book.who = req.query.who;
	  return res.status(200).json({ message: `Book ${id} updated`, book });
	} else if (req.query.due !== undefined) {
	  book.due = req.query.due;
	  return res.status(200).json({ message: `Book ${id} updated`, book });
	}
	
	
	// otherwise, fall back to JSON body merge 
	Object.assign(book, req.body);
	return res.status(200).json( { message: `Book ${id} updated`, book } );
});



// ╔══════════════════════════════════════════════════════╗
// ║                 DELETE /books/:id                    ║
// ╚══════════════════════════════════════════════════════╝
app.delete('/books/:id', (req, res) => {
  const book = books[req.params.id];
  if (!book) {
    return res.sendStatus(204);
  }
  delete books[req.params.id];
  return res.status(200).json({ message: `Book with id ${req.params.id} deleted` });
});



// ╔══════════════════════════════════════════════════════╗
// ║                start server listener                 ║
// ╚══════════════════════════════════════════════════════╝
app.listen(PORT, () => {
  console.log(`Library API server listening at http://localhost:${PORT}`);
});
