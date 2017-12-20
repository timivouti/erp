var express = require('express');
var router = express.Router();

var User = require('../models/user');

router.get('/user', ensureAuthenticated, function(req, res) {
    res.render('settings');
});

function ensureAuthenticated(req, res, next) {
    if (req.isAuthenticated()){
        return next();
    }
    else {
        //req.flash('error_msg', 'You are not logged in');
        res.redirect('/users/login');
    }
}

router.put('/user/update/:username', (req, res, next)=>{
    var name = req.body.name;
    var email = req.body.email;
    var username = req.params.username;
    var picture = req.body.picture;

    req.checkBody('name', 'Name is required').notEmpty();
    req.checkBody('email', 'Email is required').notEmpty();
    req.checkBody('email', 'Email is not valid').isEmail();

    var errors = req.validationErrors();

    if(errors) {
        res.render('settings', {
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
    })
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

module.exports = router;