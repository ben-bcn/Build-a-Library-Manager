const express = require('express');
const router = express.Router();
const Book = require("../models").Book;
const Loan = require('../models').Loan;
const Patron = require('../models').Patron;
var moment = require('moment');

//Date Functions
const addDays = (days) => {
    return moment().add(days,'days').format('YYYY-MM-DD');
}

const createToday = () => {
    return moment().format('YYYY-MM-DD'); ;
}

/* GET patrons listing. */
router.get('/', function(req, res, next) {
  Patron.findAll({order: [["last_name", "ASC"]]}).then(function(patrons){
    res.render("patrons/index", {patrons: patrons});
  }).catch(function(error){
      //res.send(500, error);
      res.status(500).send(error)
   });
});

/* POST create patron. */
router.post('/', function(req, res, next) {
  Patron.create(req.body).then(function(patron) {
    res.redirect("/patrons/");
  }).catch(function(error){
      if(error.name === "SequelizeValidationError") {
        res.render("patrons/new", {patron: Patron.build(req.body), errors: error.errors, title: "New Book"})
      } else {
        throw error;
      }
  }).catch(function(error){
      res.status(500).send(error);
   });
});

/* Create a new patron form. */
router.get('/new', function(req, res, next) {
  res.render("patrons/new", {patron: {}, title: "New Patron", formBt: "Create New Patron"});
});

/* Edit patron form. */
router.get('/detail/:id', (req, res) => {
    Patron.findByPk(req.params.id, {
        include: [
            {
                model: Loan,
                include: [
                    Book
                ]
            }
        ]
    })
    .then( patron => {
        if(patron){
            res.render('patrons/edit', {patron: patron})
        } else {
            res.send(404)
        }
    })
    .catch( error => {
        console.log(error);
    })
})


/* Delete patron form. */
router.get("/:id/delete", function(req, res, next){
  Patron.findById(req.params.id).then(function(patron){
    if(patron) {
      res.render("patrons/delete", {patron: patron, title: "Delete Patron"});
    } else {
      res.send(404);
    }
  }).catch(function(error){
      res.send(500, error);
   });
});


/* GET individual patron. */
router.get("/:id", function(req, res, next){
  Patron.findById(req.params.id).then(function(patron){
    if(patron) {
      res.render("patrons/show", {patron: patron, title: patron.title});
    } else {
      res.send(404);
    }
  }).catch(function(error){
      res.send(500, error);
   });
});

/* GET patron and loan for return. */
router.get("/return/:id", function(req, res, next){
  Loan.findByPk(req.params.id, {
      include: [Book, Patron]
    })
  .then(function(loan){
    if(loan) {
      res.render("patrons/return", {loan: loan, today: createToday(), inOneYear: addDays(365), yearAgo: addDays(-365)});
    } else {
      console.log("beeb");
      res.send(404);
    }
  }).catch(function(error){
      res.send(500, error);
   });
});

/* PUT update patron. */
router.put("/:id", function(req, res, next){
  Patron.findById(req.params.id).then(function(patron){
    if(patron) {
      return patron.update(req.body);
    } else {
      res.send(404);
    }
  }).then(function(patron){
    // res.redirect("/patrons/" + patron.id);
    res.redirect("/patrons/");
  }).catch(function(error){
      if(error.name === "SequelizeValidationError") {
        var patron = Patron.build(req.body);
        patron.id = req.params.id;
        res.render("patrons/edit", {patron: patron, errors: error.errors, title: "Edit Book"})
      } else {
        throw error;
      }
  }).catch(function(error){
      res.send(500, error);
   });
});

module.exports = router;
