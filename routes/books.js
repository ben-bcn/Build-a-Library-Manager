var express = require('express');
var router = express.Router();
var Book = require("../models").Book;

/* GET books listing. */
router.get('/', function(req, res, next) {
  Book.findAll({order: [["genre", "DESC"]]}).then(function(books){
    // res.render("books/index", {books: books, title: "My Awesome Blog" });
    res.render("books/index", {books: books});
  }).catch(function(error){
      //res.send(500, error);
      res.status(500).send(error)
   });
});

/* POST create article. */
router.post('/', function(req, res, next) {
  Book.create(req.body).then(function(article) {
    res.redirect("/books/" + article.id);
  }).catch(function(error){
      if(error.name === "SequelizeValidationError") {
        res.render("books/new", {article: Book.build(req.body), errors: error.errors, title: "New Book"})
      } else {
        throw error;
      }
  }).catch(function(error){
      res.send(500, error);
   });
;});

/* Create a new article form. */
router.get('/new', function(req, res, next) {
  res.render("books/new", {article: {}, title: "New Book"});
});

/* Edit article form. */
router.get("/:id/edit", function(req, res, next){
  Book.findById(req.params.id).then(function(article){
    if(article) {
      res.render("books/edit", {article: article, title: "Edit Book"});
    } else {
      res.send(404);
    }
  }).catch(function(error){
      res.send(500, error);
   });
});


/* Delete article form. */
router.get("/:id/delete", function(req, res, next){
  Book.findById(req.params.id).then(function(article){
    if(article) {
      res.render("books/delete", {article: article, title: "Delete Book"});
    } else {
      res.send(404);
    }
  }).catch(function(error){
      res.send(500, error);
   });
});


/* GET individual article. */
router.get("/:id", function(req, res, next){
  Book.findById(req.params.id).then(function(article){
    if(article) {
      res.render("books/show", {article: article, title: article.title});
    } else {
      res.send(404);
    }
  }).catch(function(error){
      res.send(500, error);
   });
});

/* PUT update article. */
router.put("/:id", function(req, res, next){
  Book.findById(req.params.id).then(function(article){
    if(article) {
      return article.update(req.body);
    } else {
      res.send(404);
    }
  }).then(function(article){
    res.redirect("/books/" + article.id);
  }).catch(function(error){
      if(error.name === "SequelizeValidationError") {
        var article = Book.build(req.body);
        article.id = req.params.id;
        res.render("books/edit", {article: article, errors: error.errors, title: "Edit Book"})
      } else {
        throw error;
      }
  }).catch(function(error){
      res.send(500, error);
   });
});

/* DELETE individual article. */
router.delete("/:id", function(req, res, next){
  Book.findById(req.params.id).then(function(article){
    if(article) {
      return article.destroy();
    } else {
      res.send(404);
    }
  }).then(function(){
    res.redirect("/books");
  }).catch(function(error){
      res.send(500, error);
   });
});


module.exports = router;
