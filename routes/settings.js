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

router.put('/user/:id', (req, res, next)=>{
    var name = req.body.name;
    var email = req.body.email;
    var picture = req.body.picture;

    req.checkBody('name', 'Name is required').notEmpty();
    req.checkBody('email', 'Email is required').notEmpty();
    req.checkBody('email', 'Email is not valid').isEmail();

    Item.findOneAndUpdate({_id: req.params.id}, {
        $set:{
            name: name,
            email: email,
            picture: picture
        }
    },
    function(err, result) {
        if(err){
            res.render('settings', {
            errors:errors
            });
        }
        else{
            res.json(result);
        }
    })
});

module.exports = router;