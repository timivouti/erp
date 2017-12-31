var express = require('express');
var router = express.Router();
var User = require('../models/user');
var entry = require('../entry');
const mysql = require('mysql2');

router.get('/', ensureAuthenticated, function(req, res, next) {
    getSales(function (err, salesResult){ 
        //you might want to do something is err is not null...      
        res.render('sales', {'result': salesResult});
     });
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




function getSales(callback) { 
    entry.connection.query("SELECT * FROM sales",
        function (err, rows) {
            callback(err, rows); 
        }
    );
}
  


router.get('/add', ensureAuthenticated, function(req, res, next) {
    res.render('addsales');
});


router.post('/add/new', ensureAuthenticated, function(req,res) {
    var order_date = req.body.order_date;
    var customer_name = req.body.customer_name;
    var product_code = req.body.product_code;
    var order_amount = req.body.order_amount;
    var order_pricewovat = req.body.order_pricewovat;
    var order_pricevat = req.body.order_pricevat;
    var order_totalprice = req.body.order_totalprice;

    req.checkBody('order_date', 'Order date is required').notEmpty();
    req.checkBody('customer_name', 'Customer name is required').notEmpty();
    req.checkBody('product_code', 'Product code is required').notEmpty();
    req.checkBody('order_amount', 'Order amount is required').notEmpty();
    req.checkBody('order_pricewovat', 'Order price without VAT is required').notEmpty();
    req.checkBody('order_pricevat', 'Order VAT price is required').notEmpty();
    req.checkBody('order_totalprice', 'Order total price is required').notEmpty();

    var errors = req.validationErrors();

    if(errors) {
        res.render('addsales', {
            errors:errors
        });
        return;
    }

    var values = "'" + order_date + "', '" + customer_name + "', " + product_code + ", " + order_amount + ", " + order_pricewovat + ", " + order_pricevat + ", " + order_totalprice;

    var sql = "INSERT INTO sales (order_date, customer_name, product_code, order_amount, order_pricewovat, order_vatprice, order_totalprice) VALUES (" + values + ")";
    entry.connection.query(sql, function (err, result) {
      if (err) throw err;
    });

    res.redirect('/sales');
    });

    router.get('/remove/:order_number', ensureAuthenticated, function(req,res) {
        var orderNumber = req.params.order_number;
        var sql = "DELETE FROM sales WHERE order_number = " + orderNumber;
        entry.connection.query(sql, function (err, result) {
            if (err) throw err;
        });
        
        res.redirect('/sales');
    });

    router.get('/edit/:order_number', ensureAuthenticated, function(req, res) {
        var orderNumber = req.params.order_number;
        

        function getSalesEdit(callback) {
            entry.connection.query("SELECT * FROM sales WHERE order_number = " + orderNumber,
                function (err, rows) {
                    callback(err, rows); 
                }
            );    
        }
        getSalesEdit(function (err, salesResult, orderNumber){      
            res.render('editsales', {'result': salesResult});
         });
    });

    router.post('/edit/:order_number', ensureAuthenticated, function(req, res) {
        var orderNumber = req.params.order_number;
        var order_date = req.body.order_date;
        var customer_name = req.body.customer_name;
        var product_code = req.body.product_code;
        var order_amount = req.body.order_amount;
        var order_pricewovat = req.body.order_pricewovat;
        var order_pricevat = req.body.order_pricevat;
        var order_totalprice = req.body.order_totalprice;
    
        req.checkBody('order_date', 'Order date is required').notEmpty();
        req.checkBody('customer_name', 'Customer name is required').notEmpty();
        req.checkBody('product_code', 'Product code is required').notEmpty();
        req.checkBody('order_amount', 'Order amount is required').notEmpty();
        req.checkBody('order_pricewovat', 'Order price without VAT is required').notEmpty();
        req.checkBody('order_pricevat', 'Order VAT price is required').notEmpty();
        req.checkBody('order_totalprice', 'Order total price is required').notEmpty();

        var errors = req.validationErrors();

        function getSalesEdit(callback) {
            entry.connection.query("SELECT * FROM sales WHERE order_number = " + orderNumber,
                function (err, rows) {
                    callback(err, rows); 
                }
            );    
        }

        if(errors) {
            getSalesEdit(function (err, salesResult, orderNumber){     
                res.render('editsales', {'result': salesResult, errors:errors});
             });
        return;
        }

        var SET = "SET order_date='" + order_date + "', customer_name='" + customer_name + "', product_code=" + product_code + ", order_amount=" + order_amount
        + ", order_pricewovat=" + order_pricewovat +  ", order_vatprice=" + order_pricevat + ", order_totalprice=" + order_totalprice;


        entry.connection.query("UPDATE sales " + SET + " WHERE order_number=" + orderNumber);

        req.flash('success_msg', 'You have edited the sale');

        getSalesEdit(function (err, salesResult, orderNumber){     
            res.render('editsales', {'result': salesResult, success_msg:req.flash('success_msg')});
         });
    });




module.exports = router;