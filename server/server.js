const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const hbs = require('hbs');
const {mongoose} = require('./db/mongoose');
const {Book} = require('./models/book');
const {ObjectID} = require('mongodb');

const app = express();
const port = process.env.PORT || 3000;
const delivery_charges = 15;

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

hbs.registerPartials(path.join(__dirname, '../views/partials'));
app.set('view engine', 'hbs');
app.use(express.static(path.join(__dirname, "../public")));



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
    Book.find().then(books => {
        res.render('book/list.hbs', {books});
    }, (err) => {
        return console.log(err);
    });
});

app.get('/book/borrow/:id', (req, res) => {
    var id = req.params.id;

    if(!ObjectID.isValid(id)) {
        res.redirect('/book/list');
    }
    Book.findById(id).then(book => {
        book.delivery_charges = delivery_charges;
        res.render('book/details.hbs', {book});
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
        book.delivery_charges = delivery_charges;
        book.total_fees = book.delivery_charges + book.fee;
        res.render('book/cart.hbs', {book});
    }, err => {
        return console.log(err);
    });
    
});



app.listen(port, () => {
    console.log(`Server started at port ${port}`);
})
