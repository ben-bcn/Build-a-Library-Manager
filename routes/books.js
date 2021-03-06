const express = require('express');
const router  = express.Router();
const Book    = require("../models").Book;
const Loan    = require('../models').Loan;
const Patron  = require('../models').Patron;
var moment    = require('moment');
const { Op }  = require('sequelize');

//Date Functions
const addDays = (days) => {
    return moment().add(days,'days').format('YYYY-MM-DD');
}

const createToday = () => {
    return moment().format('YYYY-MM-DD'); ;
}

/* GET books listing. */
router.get('/', function(req, res, next) {
  Book.findAll({order: [["genre", "ASC"]]}).then(function(books){
    res.render("books/index", {books: books});
  }).catch(function(error){
      //res.send(500, error);
      res.status(500).send(error)
   });
});

/* POST create book. */
router.post('/', function(req, res, next) {
  Book.create(req.body).then(function(book) {
    res.redirect("/books/");
  }).catch(function(error){
      if(error.name === "SequelizeValidationError") {
        res.render("books/new", {book: Book.build(req.body), errors: error.errors, title: "New Book"})
      } else {
        throw error;
      }
  }).catch(function(error){
      res.status(500).send(error);
   });
});

/* GET books listing for overdue books. */
router.get('/overdue/', function(req, res, next) {
  Book.findAll({
    include: [{
      model: Loan,
      where: {
        returned_on: null,
        return_by: {
          [Op.lt]: createToday()
        }
      }
    }],
    order: [["genre", "ASC"]]
  }).then(function(books){
    res.render("books/index", {books: books, subTitle: ': Overdue'});
  }).catch(function(error){
      //res.send(500, error);
      res.status(500).send(error)
   });
});

/* GET books listing for checkout books, using today at the pivot point. */
router.get('/checked-out/', function(req, res, next) {
  Book.findAll({
    include: [{
      model: Loan,
      where: {
        returned_on: null,
        return_by: {
          [Op.gt]: createToday()
        }
      }
    }],
    order: [["genre", "ASC"]]
  }).then(function(books){
    res.render("books/index", {books: books, subTitle: ': Checked Out (not overdue)'});
  }).catch(function(error){
      //res.send(500, error);
      res.status(500).send(error)
   });
});

/* Create a new book form. */
router.get('/new', function(req, res, next) {
  res.render("books/new", {book: {}, title: "New Book", formBt: "Create New Book"});
});

/* Edit book form. */
router.get('/detail/:id', (req, res) => {
    Book.findByPk(req.params.id, {
        include: [
            {
                model: Loan,
                include: [
                    Patron
                ]
            }
        ]
    })
    .then( book => {
        if(book){
            res.render('books/edit', {book: book})
        } else {
            res.send(404)
        }
    })
    .catch( error => {
        console.log(error);
    })
})


/* Delete book form. */
router.get("/:id/delete", function(req, res, next){
  Book.findById(req.params.id).then(function(book){
    if(book) {
      res.render("books/delete", {book: book, title: "Delete Book"});
    } else {
      res.send(404);
    }
  }).catch(function(error){
      res.send(500, error);
   });
});


/* GET individual book. */
router.get("/:id", function(req, res, next){
  Book.findById(req.params.id).then(function(book){
    if(book) {
      res.render("books/show", {book: book, title: book.title});
    } else {
      res.send(404);
    }
  }).catch(function(error){
      res.send(500, error);
   });
});

/* GET book and loan for return. */
router.get("/return/:id", function(req, res, next){
  Loan.findByPk(req.params.id, {
      include: [Book, Patron]
    })
  .then(function(loan){
    if(loan) {
      res.render("books/return", {loan: loan, today: createToday(), inOneYear: addDays(365), yearAgo: addDays(-365)});
    } else {
      res.send(404);
    }
  }).catch(function(error){
      res.send(500, error);
   });
});

/* PUT update book. */
router.put("/:id", function(req, res, next){
  Book.findById(req.params.id).then(function(book){
    if(book) {
      return book.update(req.body);
    } else {
      res.send(404);
    }
  }).then(function(book){
    // res.redirect("/books/" + book.id);
    res.redirect("/books/");
  }).catch(function(error){
      if(error.name === "SequelizeValidationError") {
        var book = Book.build(req.body);
        book.id = req.params.id;
        res.render("books/edit", {book: book, errors: error.errors, title: "Edit Book"})
      } else {
        throw error;
      }
  }).catch(function(error){
      res.send(500, error);
   });
});

module.exports = router;
