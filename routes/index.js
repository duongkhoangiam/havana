var express = require('express');
var router = express.Router();
const async = require('async');
const Product = require('../model/product');
const Category = require('../model/category');

/*------------------------------------
* Author : Dang Minh Truong
* Email : mr.dangminhtruong@gmail.com
*-----------------------------------*/

router.get('/change-languages/:lang', function(req, res, next) {
	res.cookie('lang', req.params.lang, { maxAge: 900000 });
	res.redirect('back');
});
/*--------------------------------------------------------*/
router.get('/index', function(req, res, next) {
	async.parallel([
		function(callback){
			Product.find().sort( { createdOn: -1 } ).limit(4)
				.exec((err, news) => {
					callback(null, news);
				});
		},
		function(callback){
			Product.find({ status : 2 }).limit(4)
				.exec((err, features) => {
					callback(null, features);
				});
		}
	],
		// Call back
	function(err, results) {
		if(err){
			console.log(err);
		}
		res.render('index',{
			news : results[0],
			features : results[1],
			cart : req.session.cart
		});
		next();
	});
});
/*--------------------------------------------------------*/
router.get('/product/:id', function(req, res, next) {
	async.parallel([
		function(callback){
			Product.find({ _id : req.params.id})
				.exec((err, product) => {
					callback(null, product);
				});
		},
		function(callback){
			Product.find().sort({ createdOn : -1 }).limit(4)
				.exec((err, related_product) => {
					callback(null, related_product);
				});
		}
	], 
	function(err, results){
		res.render('./pages/product', {
			product : results[0][0],
			related_product : results[1],
			cart : req.session.cart
		});
	});
  
});
/*--------------------------------------------------------*/
router.get('/category/:id', function(req, res, next) {
	async.parallel([
		(callback) => {
			if(req.query.pages != null){
				Product.find({ category_id : req.params.id }).limit(6).skip((req.query.pages-1)* 6)
					.exec((err, category_products) => {
						callback(null, category_products);
					});
			}else{
				Product.find({ category_id : req.params.id }).limit(6)
					.exec((err, category_products) => {
						callback(null, category_products);
					});
			}
           
		},
		(callback) => {
			Product.find().sort({ createdOn : -1 }).limit(3)
				.exec((err, latest_products) => {
					callback(null, latest_products);
				});
		},
		(callback) => {
			Product.find().sort({ saled : -1 }).limit(3)
				.exec((err, best_sales) => {
					callback(null, best_sales);
				});
		},
		(callback) => {
			Product.find({ category_id : req.params.id }).count()
				.exec((err, total_records) => {
					callback(null, total_records);
				});
		}
	], 
	(err, results) => {
		res.render('./pages/category', {
			category_products :  results[0],
			latest_products : results[1],
			best_sales : results[2],
			pages :  Math.ceil(results[3] / 6),
			category_current : req.params.id,
			cart : req.session.cart
		});
	});
    
});
/*--------------------------------------------------------*/
module.exports = router;