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
            res.render('loans/new', {loan: Loan.build(req.body), errors: error.errors, allBooks: values[0], allPatrons: values[1], today: createToday(), sevenDaysFromToday: addDays(7), inOneYear: addDays(365), yearAgo: addDays(-365)})
        })
      } else {
        throw error;
      }
  }).catch(function(error){
      res.status(500).send(error);
   });
});

/* GET overdue loans listing, using today at the pivot point. */
router.get('/overdue/', function(req, res, next) {
  Loan.findAll({
    include: [Book,Patron],
    where: {
      returned_on: null,
      return_by: {
        [Op.lt]: createToday()
      }
    },
    order: [["loaned_on", "ASC"]]
  }).then(function(loans){
    res.render("loans/index", {loans: loans, subTitle: ': Overdue'});
  }).catch(function(error){
      //res.send(500, error);
      res.status(500).send(error)
   });
});

/* GET checkedout loans listing, using today at the pivot point. */
router.get('/checked-out/', function(req, res, next) {
  Loan.findAll({
    include: [Book,Patron],
    where: {
      returned_on: null,
      return_by: {
        [Op.gt]: createToday()
      }
    },
    order: [["loaned_on", "ASC"]]
  }).then(function(loans){
    res.render("loans/index", {loans: loans, subTitle: ': Checked Out (not overdue)'});
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
      res.render('loans/new', {loan: Loan.build(req.body), allBooks: values[0], allPatrons: values[1], today: createToday(), sevenDaysFromToday: addDays(7), inOneYear: addDays(365), yearAgo: addDays(-365)})
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

/* PUT update loan. */
router.put("/:id", function(req, res, next){
  Loan.findByPk(req.params.id, {
      include: [Book, Patron]
  }).then(function(loan){
    if(loan) {
      return loan.update(req.body);
    } else {
      res.send(404);
    }
  }).then(function(loan){
    res.redirect("/loans/");
  }).catch(function(error){
      console.log(error.name);
      if(error.name === "SequelizeValidationError") {
        // Reload the data we need to display the  return page + error message
        Loan.findByPk(req.params.id, {include: [Book, Patron]
        }).then(function(loan){
          res.render("books/return", {loan: loan, errors: error.errors, today: createToday(), inOneYear: addDays(365), yearAgo: addDays(-365)});
        });
      } else {
        throw error;
      }
  }).catch(function(error){
      res.send(500, error);
   });
});
module.exports = router;
