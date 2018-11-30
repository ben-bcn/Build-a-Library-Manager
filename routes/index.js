const express = require('express');
const router  = express.Router();

// get the data file of projects
//const data = require('../data.json');
// below is the equiv to saying cards = data.projects
//const { projects } = data;

router.get('/', (req,res) => {

  res.render('index');
  // res.render('index',{ projects });
  // Above is shorthand for the below
  //res.render('index', {projects: projects});

});


router.get('/about', (req,res) => {
    res.render('about');
});

// for sending post data
router.get('/projects/:id', (req,res) => {
  var { id }    = req.params;

  if(!id){
    return res.redirect('/');
  } else if(isNaN(id) || id > data.projects.length){
    // if project id not a number or doesn't exist then we redirect to home
    return res.redirect('/');
  }
  // decrement id to match array index
  id--;
  const project = data.projects[id];
  res.render('project',{ project });
});

// to cancel cookie
router.post('/goodbye', (req,res) => {
  res.clearCookie('username');
  res.redirect('/hello');
});

module.exports = router;
