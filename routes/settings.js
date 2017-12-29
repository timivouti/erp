var express = require('express');
var router = express.Router();

var User = require('../models/user');

router.get('/user', ensureAuthenticated, function(req, res) {
    res.render('usersettings');
});

function ensureAuthenticated(req, res, next) {
    if (req.isAuthenticated()){
        return next();
    }
    else {
        req.flash('error_msg', 'You are not logged in');
        res.redirect('/users/login');
    }
}

router.put('/user/update/:username', ensureAuthenticated, (req, res, next)=>{
    var name = req.body.name;
    var email = req.body.email;
    var username = req.params.username;
    var picture = req.body.picture;

    req.checkBody('name', 'Name is required').notEmpty();
    req.checkBody('email', 'Email is required').notEmpty();
    req.checkBody('email', 'Email is not valid').isEmail();

    var errors = req.validationErrors();

    if(errors) {
        res.render('usersettings', {
            errors:errors
        });
    }
    else {

    User.findOneAndUpdate({username: req.params.username}, {
        $set:{
            name: req.body.name,
            email: req.body.email,
            picture: req.body.picture
        }
    },
    function(err, result) {
        if(err){
            throw err;
        }
        else{
            req.flash('success_msg', 'Your user settings were changed');
            res.redirect('/settings/user');
        }
    });
    }
});

router.get('/users', (req, res, next)=>{
    User.find(function(err, items){
        if(err){
            res.json(err);
        }
        else{
            res.json(items);
        }
    });
});

router.get('/company', ensureAuthenticated, function(req, res) {
    res.render('companysettings');
});

router.post('/company/create/:username', ensureAuthenticated, function(req,res) {
    var company_name = req.body.companyname;
    var address = req.body.adress;
    var postcode = req.body.postcode;
    var city = req.body.city;
    var country = req.body.country;
    var phonenumber = req.body.phonenumber;
    var email = req.body.email;
    var companyId = randomCompanyid();

    req.checkBody('companyname', 'Company name is required').notEmpty();
    req.checkBody('address', 'Address is required').notEmpty();
    req.checkBody('postcode', 'Post code is required').notEmpty();
    req.checkBody('city', 'City is required').notEmpty();
    req.checkBody('country', 'Country is required').notEmpty();
    req.checkBody('phonenumber', 'Phone Number is required').notEmpty();
    req.checkBody('email', 'Email is required').notEmpty();
    req.checkBody('email', 'Email is not valid').isEmail();

    var errors = req.validationErrors();

    if(errors) {
        res.render('companysettings', {
            errors:errors
        });
        return;
    }
    else {
        User.findOneAndUpdate({username: req.params.username}, {
            $set:{
                companyActive: true,
                company: companyId
            }
        },
        function(err, result) {
            if(err){
                throw err;
            }
            else{
                req.flash('success_msg', 'Your company was made');
                res.redirect('/settings/company');
            }
        });
    }
});

router.post('/company/remove/:username', ensureAuthenticated, function(req,res) {
    User.findOneAndUpdate({username: req.params.username}, {
        $set:{
            companyActive: false,
            company: null
        }
    },
    function(err, result) {
        if(err){
            throw err;
        }
        else{
            req.flash('success_msg', 'You left from your company');
            res.redirect('/settings/company');
        }
    });
});

router.post('/company/join/:username', ensureAuthenticated, function(req,res) {
    var companyid = req.body.companyid;

    req.checkBody('companyid', 'Company ID is required').notEmpty();

    var errors = req.validationErrors();

    User.findOneAndUpdate({username: req.params.username}, {
        $set:{
            companyActive: true,
            company: companyid
        }
    },
    function(err, result) {
        if(err){
            throw err;
        }
        else{
            req.flash('success_msg', 'You joined a company');
            res.redirect('/settings/company');
        }
    });
});


function randomCompanyid() {
    var chars = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXTZabcdefghiklmnopqrstuvwxyz";
      var string_length = 12;
      var result = '';
      for (var i=0; i<string_length; i++) {
          var rnum = Math.floor(Math.random() * chars.length);
          result += chars.substring(rnum,rnum+1);
      }
      return result;
  }

module.exports = router;