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

/* GET loans listing. */
router.get('/', function(req, res, next) {
  Loan.findAll({include: [Book,Patron],order: [["loaned_on", "ASC"]]}).then(function(loans){
    res.render("loans/index", {loans: loans});
  }).catch(function(error){
      //res.send(500, error);
      res.status(500).send(error)
   });
});

/* POST create loan. */
router.post('/', function(req, res, next) {
  Loan.create(req.body).then(function(loan) {
      res.redirect("/loans/");
  }).catch(function(error){
      if(error.name === "SequelizeValidationError") {
        Promise.all([Book.findAll(), Patron.findAll()])
        .then( values => {
            res.render('loans/new', {loan: Loan.build(req.body), errors: error.errors, allBooks: values[0], allPatrons: values[1], today: createToday(), sevenDaysFromToday: addDays(7)})
        })
      } else {
        throw error;
      }
  }).catch(function(error){
      res.status(500).send(error);
   });
});

/* GET overdue loans listing. */
router.get('/overdue/', function(req, res, next) {
  Loan.findAll({
    include: [Book,Patron],
    where: {
      returned_on: null,
      return_by: {
        $gt: createToday()
      }
    },
    order: [["loaned_on", "ASC"]]
  }).then(function(loans){
    res.render("loans/index", {loans: loans});
  }).catch(function(error){
      //res.send(500, error);
      res.status(500).send(error)
   });
});

/* Create a new loan form. */
router.get('/new', function(req, res, next) {
  //Promise.all to wait for two queries to the database to finish before moving on
  Promise.all([Book.findAll(), Patron.findAll()])
  .then( values => {
      res.render('loans/new', {loan: Loan.build(req.body), allBooks: values[0], allPatrons: values[1], today: createToday(), sevenDaysFromToday: addDays(7)})
      //, addDays: addDays
  })
  .catch( error => {
      console.log(error);
  })
});

/* Edit loan form. */
router.get('/detail/:id', (req, res) => {
    Loan.findByPk(req.params.id, {
        include: [
            {
                model: Book,
                include: [
                    Patron
                ]
            }
        ]
    })
    .then( loan => {
        if(loan){
            res.render('loans/edit', {loan: loan})
        } else {
            res.send(404)
        }
    })
    .catch( error => {
        console.log(error);
    })
})


/* Delete loan form. */
router.get("/:id/delete", function(req, res, next){
  Loan.findById(req.params.id).then(function(loan){
    if(loan) {
      res.render("loans/delete", {loan: loan, title: "Delete Book"});
    } else {
      res.send(404);
    }
  }).catch(function(error){
      res.send(500, error);
   });
});


/* GET individual loan. */
router.get("/:id", function(req, res, next){
  Loan.findById(req.params.id).then(function(loan){
    if(loan) {
      res.render("loans/show", {loan: loan, title: loan.title});
    } else {
      res.send(404);
    }
  }).catch(function(error){
      res.send(500, error);
   });
});

/* PUT update loan. */
router.put("/:id", function(req, res, next){
  Loan.findByPk(req.params.id).then(function(loan){
    if(loan) {
      return loan.update(req.body);
    } else {
      res.send(404);
    }
  }).then(function(loan){
    // res.redirect("/loans/" + loan.id);
    res.redirect("/loans/");
  }).catch(function(error){
      if(error.name === "SequelizeValidationError") {
        var loan = Loan.build(req.body);
        loan.id = req.params.id;
        res.render("loans/edit", {loan: loan, errors: error.errors, title: "Edit Book"})
      } else {
        throw error;
      }
  }).catch(function(error){
      res.send(500, error);
   });
});

/* DELETE individual loan. */
router.delete("/:id", function(req, res, next){
  Loan.findById(req.params.id).then(function(loan){
    if(loan) {
      return loan.destroy();
    } else {
      res.send(404);
    }
  }).then(function(){
    res.redirect("/loans");
  }).catch(function(error){
      res.send(500, error);
   });
});


module.exports = router;
