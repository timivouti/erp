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
    function getProducts(callback) { 
        entry.connection.query("SELECT * FROM products WHERE company_id='" + company_id + "'" ,
            function (err, rows) {
                callback(err, rows); 
            }
        );
    }
    getProducts(function (err, productsResult){       
        res.render('products', {'result': productsResult});
     });
});

router.get('/add/new', ensureAuthenticated, function(req, res) {
    res.render('addproducts');
});

router.post('/add/:company_id', ensureAuthenticated, function(req, res) {
        var product_name = req.body.product_name;
        var unitprice = req.body.unitprice;
        var production_cost = req.body.production_cost;
        var vat = req.body.vat;
        var company_id = req.params.company_id;
    
        req.checkBody('product_name', 'Product name is required').notEmpty();
        req.checkBody('unitprice', 'Unit price is required').notEmpty();
        req.checkBody('production_cost', 'Production cost is required').notEmpty();
        req.checkBody('vat', 'VAT is required').notEmpty();
    
        var errors = req.validationErrors();
    
        if(errors) {
            res.render('addsales', {
                errors:errors
            });
            return;
        }

        var sql = "SELECT MAX(product_number) AS max FROM products WHERE company_id='" + company_id + "'";

        entry.connection.query(sql, function (err, result) {
            if (err) throw err;
            var product_number = (result[0].max + 1);
            addNewProduct(product_number);
        });

        function addNewProduct(product_number) {
        var values = product_number + ", '" + product_name + "', " + unitprice + ", " + production_cost + ", " + vat + ", '" + company_id + "'";
        var sql = "INSERT INTO products (product_number, product_name, unitprice, production_cost, vat, company_id) VALUES (" + values + ")";
        entry.connection.query(sql, function (err, result) {
            if (err) throw err;
        });     
        req.flash('success_msg', 'Product was added');
        res.redirect('/products/' + company_id); 
        }
});


router.get('/remove/:product_number/:company_id', ensureAuthenticated, function(req, res) {
    var product_number = req.params.product_number;
    var company_id = req.params.company_id;
    

        var sql = "DELETE FROM products WHERE product_number = " + product_number + " AND company_id='" + company_id + "'";
        entry.connection.query(sql, function (err, result) {
            if (err) throw err;
        });
        
        res.redirect('/products/' + company_id);
 
});

router.get('/edit/:product_number/:company_id', ensureAuthenticated, function(req, res) {
    var product_number = req.params.product_number;
    var company_id = req.params.company_id;
    

    function getProductsEdit(callback) {
        entry.connection.query("SELECT * FROM products WHERE product_number= " + product_number + " AND company_id='" + company_id + "'",
            function (err, rows) {
                callback(err, rows); 
            }
        );    
    }
    getProductsEdit(function (err, productsResult){      
        res.render('editproducts', {'result': productsResult});
     });
});

router.post('/edit/:product_number/:company_id', ensureAuthenticated, function(req, res) {
    var product_name = req.body.product_name;
    var unitprice = req.body.unitprice;
    var production_cost = req.body.production_cost;
    var vat = req.body.vat;
    var company_id = req.params.company_id;
    var product_number = req.params.product_number;

    req.checkBody('product_name', 'Product name is required').notEmpty();
    req.checkBody('unitprice', 'Unit price is required').notEmpty();
    req.checkBody('production_cost', 'Production cost is required').notEmpty();
    req.checkBody('vat', 'VAT is required').notEmpty();

    var errors = req.validationErrors();

    function getProductsEdit(callback) {
        entry.connection.query("SELECT * FROM products WHERE product_number=" + product_number + " AND company_id='" + company_id + "'",
            function (err, rows) {
                callback(err, rows); 
            }
        );    
    }

    if(errors) {
        getProductsEdit(function (err, productsResult){     
            res.render('editproducts', {'result': productsResult, errors:errors});
         });
    return;
    }

    var SET = "SET product_name='" + product_name + "', unitprice=" + unitprice + ", production_cost=" + production_cost + ", vat=" + vat; 

        entry.connection.query("UPDATE products " + SET + " WHERE product_number=" + product_number + " AND company_id='" + company_id + "'");

        req.flash('success_msg', 'You have edited the product');

        getProductsEdit(function (err, productsResult){     
            res.render('editproducts', {'result': productsResult, success_msg:req.flash('success_msg')});
         });
    });


module.exports = router;