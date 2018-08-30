const express = require('express');
const path = require('path');
const http = require('http');
const bodyParser = require('body-parser');
const hbs = require('hbs');
const {mongoose} = require('./db/mongoose');
const {Book} = require('./models/book');
const {ObjectID} = require('mongodb');
const socketIO = require('socket.io');

const app = express();
const port = process.env.PORT || 3000;
const server = http.createServer(app);
const io = socketIO(server);
const delivery_charges = 15;

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

hbs.registerPartials(path.join(__dirname, '../views/partials'));
hbs.registerHelper('ifEquals', function(arg1, arg2, options) {
    return (arg1 == arg2) ? options.fn(this) : options.inverse(this);
});
app.set('view engine', 'hbs');
app.use(express.static(path.join(__dirname, "../public")));

io.on('connection', (socket) => {
    console.log('New user connected');
    
    socket.emit('newUser', {
        from: 'Admin',
        text: 'Welcome to the Library Application'
    });

    Book.find().then(books => {
        io.emit('bookList', books);
    }, (err) => {
        return console.log(err);
    });

    app.get('/', (req, res) => {
        res.render('home.hbs');
    });
    
    app.get('/book/add', (req, res) => {
        res.render('book/add.hbs');
    });
    
    app.post('/book/save', (req, res) => {
        if(!req.body) {
            return false;
        }
        var book = new Book({
            title: req.body.title,
            author: req.body.author,
            fee: req.body.fee,
            about_author: req.body.about_author
        });
    
        book.save().then((book) => {
            res.redirect('/book/list');
        }, (err) => {
            return console.log(err);
        })
    });
    
    app.get('/book/list', (req, res) => {
        res.render('book/list.hbs');
    });
    
    app.get('/book/borrow/:id', (req, res) => {
        var id = req.params.id;
    
        if(!ObjectID.isValid(id)) {
            res.redirect('/book/list');
        }
        Book.findById(id).then(book => {
            book.delivery_charges = delivery_charges;
            res.render('book/details.hbs', {book}, () => {
                socket.broadcast.emit('outOfStock', book);
                res.send(book);
            });
        }, err => {
            return console.log(err);
        });
    });
    
    app.post('/book/cart', (req, res) => {
        if(!req.body)  {
            return false;
        }
        var id = req.body.id;
        if(!ObjectID.isValid(id)) {
            res.redirect('/book/list');
        }
        Book.findById(id).then(book => {
            console.log(book);
            if(book.status === 'out of stock') {
                res.redirect('/book/list');
            }
            book.delivery_charges = delivery_charges;
            book.total_fees = book.delivery_charges + book.fee;
            res.render('book/cart.hbs', {book});
        }, err => {
            return console.log(err);
        });
        
    });

    app.post('/book/checkout', (req, res) => {
        if(!req.body) {
            return false;
        }
        var id = req.body.id;
        if(!ObjectID.isValid(id)) {
            res.redirect('/book/list');
        }
        var body = {
            status: 'out of stock'
        };
        Book.findByIdAndUpdate(id, {$set:body}, {new: true}).then(book => {
            console.log('updated',book);
            res.redirect('/book/list');
        });
    });

});



server.listen(port, () => {
    console.log(`Server started at port ${port}`);
})
