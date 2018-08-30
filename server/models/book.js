const mongoose = require('mongoose');

const Book = mongoose.model('Book', {
    title: {
        type: String,
        required: true,
        minlength: 1,
        trim: true
    },
    author: {
        type: String,
        required: true,
        minlength: 1,
        trim: true,
    },
    about_author: {
        type: String,
        required: true,
        minlength: 1,
        trim: true,
    },
    fee: {
        type: Number,
        required: true,
        minlength: 1,
        trim: true,
    },
    status: {
        type: String,
        default: 'available'
    }
});

module.exports = {Book};