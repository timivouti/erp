var express = require('express');
var router = express.Router();
var entry = require('../entry');
var User = require('../models/user');

function ensureAuthenticated(req, res, next) {
    if (req.isAuthenticated()){
        return next();
    }
    else {
        req.flash('error_msg', 'You are not logged in');
        res.redirect('/users/login');
    }
}

router.get('/:company_id', ensureAuthenticated, function(req, res) {
    var company_id = req.params.company_id;
    function getCustomers(callback) { 
        entry.connection.query("SELECT * FROM customers WHERE company_id='" + company_id + "'" ,
            function (err, rows) {
                callback(err, rows); 
            }
        );
    }
    getCustomers(function (err, customersResult){       
        res.render('customers', {'result': customersResult});
     });
});

router.get('/add/new', ensureAuthenticated, function(req, res) {
    res.render('addcustomers');
});

router.post('/add/new/:company_id', ensureAuthenticated, function(req,res) {
    var customer_name = req.body.customer_name;
    var customer_address = req.body.customer_address;
    var customer_postcode = req.body.customer_postcode;
    var customer_city = req.body.customer_city;
    var customer_phonenumber = req.body.order_pricevat;
    var customer_email = req.body.customer_email;
    var company_id = req.params.company_id;

    req.checkBody('customer_name', 'Customer name is required').notEmpty();
    req.checkBody('customer_address', 'Customer address is required').notEmpty();
    req.checkBody('customer_postcode', 'Customer postcode is required').notEmpty();
    req.checkBody('customer_city', 'Customer city is required').notEmpty();
    req.checkBody('customer_phonenumber', 'Customer phonenumber is required').notEmpty();
    req.checkBody('customer_email', 'Customer email is required').notEmpty();
    req.checkBody('customer_email', 'Customer email is not valid').isEmail();

    var errors = req.validationErrors();

    if(errors) {
        res.render('addcustomers', {
            errors:errors
        });
        return;
    }

    var values = "'" + customer_name + "', '" + customer_address + "', '" + customer_postcode + "', '" + customer_city + "', '" + customer_phonenumber + "', '" + customer_email + "', '" + company_id + "'";

    var sql = "INSERT INTO customers (customer_name, customer_address, customer_postcode, customer_city, customer_phonenumber, customer_email, company_id) VALUES (" + values + ")";
    entry.connection.query(sql, function (err, result) {
      if (err) throw err;
    });

    res.redirect('/customers/' + company_id);
    });

module.exports = router;