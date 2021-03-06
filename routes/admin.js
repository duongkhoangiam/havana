var express = require('express');
var router = express.Router();
const async = require('async');
const Category = require('../model/category');
const Bill = require('../model/bill');
const Product = require('../model/product');
const Blog = require('../model/blog');
const User = require('../model/user');
const _ = require('lodash');
const bodyParser = require('body-parser');
const urlencodedParser = bodyParser.urlencoded({ extended: false });
const slug = require('slug');
var moment = require('moment');
var weekly = require('../helpers/line_chart_data');
var multer = require('multer');
var upload = multer({ dest: 'public/img' });
var fs = require('fs');
var config = require('../config/config');
const Message = require('../model/messages');
var covertToObj = require('../helpers/to_array_objects');
const Report = require('../model/report');

/*------------------------------------
* Author : Dang Minh Truong
* Email : mr.dangminhtruong@gmail.com
*-----------------------------------*/

router.get('/', function (req, res) {
	req.app.io.on('connection', (socket) => {
		new Promise((resolve) => {
			User.findByIdAndUpdate(req.user._id,
				{ status: config.activity.online },
				(err, users) => {
					if (err) {
						throw Error('cannot set online status')
					} else {
						resolve(users)
					}
				}
			);
		}).then((users) => {
			User.find({ status: config.activity.online })
				.exec((err, users) => {
					req.app.io.emit('newUserOnline', {
						onlineUsers: users,
					});
				});
		})

		socket.on('disconnect', function () {
			new Promise((resolve) => {
				User.findByIdAndUpdate(req.user._id,
					{ status: config.activity.offline },
					(err, users) => {
						if (err) {
							throw Error('cannot set online status')
						} else {
							resolve(users)
						}
					}
				);
			}).then((users) => {
				User.find({ status: config.activity.online })
					.exec((err, users) => {
						req.app.io.emit('newUserOnline', {
							onlineUsers: users,
						});
					});
			})
		});
	});

	return res.render('./admin/index', {
		user: req.user
	});
});
/*--------------------------------------------------------*/
router.get('/category/add', (req, res) => {
	res.render('./admin/pages/add_category', { user: req.user });
});
/*--------------------------------------------------------*/
router.post('/category/add', urlencodedParser, (req, res) => {
	let cate = new Category({
		name: req.body.name,
		type: req.body.type,
		descript: req.body.desc
	});
	cate.save(function (err, results) {
		res.send({
			status: 'inserted'
		});
	});

});
/*--------------------------------------------------------*/
router.get('/line-chart', (req, res) => {
	weekly(req, res);
});
/*--------------------------------------------------------*/
router.get('/bills/index', (req, res) => {
	res.render('./admin/pages/bills_main', { user: req.user });
});
/*--------------------------------------------------------*/
router.get('/bills/today-data', (req, res) => {
	Bill.find({
		createdOn: {
			$gt: moment().startOf('day'),
			$lt: moment().endOf('day')
		}
	})
		.populate('user')
		.populate({
			path: 'detais.product_id',
			select: 'name'
		})
		.exec((err, bills) => {

			res.send(bills);
		});

});
/*--------------------------------------------------------*/
router.get('/bills/week-data', (req, res) => {
	Bill.find({
		createdOn: {
			$gt: moment().startOf('week'),
			$lt: moment().endOf('week')
		}
	})
		.sort({ createdOn: -1 })
		.populate('user')
		.populate({
			path: 'detais.product_id',
			select: 'name'
		})
		.exec((err, bills) => {
			res.send(bills);
		});
});

/*--------------------------------------------------------*/
router.get('/bills/month-data', (req, res) => {
	Bill.find({
		createdOn: {
			$gt: moment().startOf('month'),
			$lt: moment().endOf('month')
		}
	})
		.populate('user')
		.populate({
			path: 'detais.product_id',
			select: 'name'
		})
		.exec((err, bills) => {
			return res.send(bills);
		});
});
/*--------------------------------------------------------*/
router.get('/bills/week-done-data', (req, res) => {
	Bill.find({
		createdOn: {
			$gt: moment().startOf('week'),
			$lt: moment().endOf('week')
		},
		status: config.status.done
	})
		.populate('user')
		.populate({
			path: 'detais.product_id',
			select: 'name'
		})
		.exec((err, bills) => {
			return res.send(bills);
		});
});
/*--------------------------------------------------------*/
router.get('/bills/week-pendding-data', (req, res) => {
	Bill.find({
		createdOn: {
			$gt: moment().startOf('week'),
			$lt: moment().endOf('week')
		},
		status: config.status.new
	})
		.populate('user')
		.populate({
			path: 'detais.product_id',
			select: 'name'
		})
		.exec((err, bills) => {
			return res.send(bills);
		});
});
/*--------------------------------------------------------*/
router.get('/bills/week-shipping-data', (req, res) => {
	Bill.find({
		createdOn: {
			$gt: moment().startOf('week'),
			$lt: moment().endOf('week')
		},
		status: config.status.shipping
	})
		.populate('user')
		.populate({
			path: 'detais.product_id',
			select: 'name'
		})
		.exec((err, bills) => {
			return res.send(bills);
		});
});
/*--------------------------------------------------------*/
router.get('/bills/week-confirm-data', (req, res) => {
	Bill.find({
		createdOn: {
			$gt: moment().startOf('week'),
			$lt: moment().endOf('week')
		},
		status: config.status.confirm
	})
		.populate('user')
		.populate({
			path: 'detais.product_id',
			select: 'name'
		})
		.exec((err, bills) => {
			return res.send(bills);
		});
});

/*--------------------------------------------------------*/
router.get('/bills/month-done-data', (req, res) => {
	Bill.find({
		createdOn: {
			$gt: moment().startOf('month'),
			$lt: moment().endOf('month')
		},
		status: config.status.done
	})
		.populate('user')
		.populate({
			path: 'detais.product_id',
			select: 'name'
		})
		.exec((err, bills) => {
			return res.send(bills);
		});
});
/*--------------------------------------------------------*/
router.get('/bills/month-pendding-data', (req, res) => {
	Bill.find({
		createdOn: {
			$gt: moment().startOf('month'),
			$lt: moment().endOf('month')
		},
		status: config.status.new
	})
		.populate('user')
		.populate({
			path: 'detais.product_id',
			select: 'name'
		})
		.exec((err, bills) => {
			return res.send(bills);
		});
});
/*--------------------------------------------------------*/
router.get('/bills/month-shipping-data', (req, res) => {
	Bill.find({
		createdOn: {
			$gt: moment().startOf('month'),
			$lt: moment().endOf('month')
		},
		status: config.status.shipping
	})
		.populate('user')
		.populate({
			path: 'detais.product_id',
			select: 'name'
		})
		.exec((err, bills) => {
			return res.send(bills);
		});
});
/*--------------------------------------------------------*/
router.get('/bills/month-confirm-data', (req, res) => {
	Bill.find({
		createdOn: {
			$gt: moment().startOf('month'),
			$lt: moment().endOf('month')
		},
		status: config.status.confirm
	})
		.populate('user')
		.populate({
			path: 'detais.product_id',
			select: 'name'
		})
		.exec((err, bills) => {
			return res.send(bills);
		});
});


/*--------------------------------------------------------*/
router.post('/bills/start-end-data', urlencodedParser, (req, res) => {
	Bill.find({
		createdOn: {
			$gt: req.body.startDay,
			$lt: req.body.endDay
		}
	})
		.populate('user')
		.populate({
			path: 'detais.product_id',
			select: 'name'
		})
		.exec((err, bills) => {
			return res.send(bills);
		});

});
/*--------------------------------------------------------*/
router.get('/bills/status-data', (req, res) => {
	Bill.find({
		status: req.query.status
	})
		.populate('user')
		.populate({
			path: 'detais.product_id',
			select: 'name'
		})
		.exec((err, bills) => {
			return res.send(bills);
		});

});
/*--------------------------------------------------------*/
router.post('/bills/start-end-pedding', urlencodedParser, (req, res) => {
	Bill.find({
		createdOn: {
			$gt: req.body.startDay,
			$lt: req.body.endDay
		},
		status: config.status.new
	})
		.populate('user')
		.populate({
			path: 'detais.product_id',
			select: 'name'
		})
		.exec((err, bills) => {
			return res.send(bills);
		});
});
/*------------------------------------------------------*/

router.post('/bills/start-end-confirmed', urlencodedParser, (req, res) => {
	Bill.find({
		createdOn: {
			$gt: req.body.startDay,
			$lt: req.body.endDay
		},
		status: config.status.confirm
	})
		.populate('user')
		.populate({
			path: 'detais.product_id',
			select: 'name'
		})
		.exec((err, bills) => {
			return res.send(bills);
		});
});

/*-------------------------------------------------------*/

router.post('/bills/start-end-shipping', urlencodedParser, (req, res) => {
	Bill.find({
		createdOn: {
			$gt: req.body.startDay,
			$lt: req.body.endDay
		},
		status: config.status.shipping
	})
		.populate('user')
		.populate({
			path: 'detais.product_id',
			select: 'name'
		})
		.exec((err, bills) => {
			return res.send(bills);
		});
});
/*-------------------------------------------------------*/
router.post('/bills/start-end-done', urlencodedParser, (req, res) => {
	Bill.find({
		createdOn: {
			$gt: req.body.startDay,
			$lt: req.body.endDay
		},
		status: config.status.done
	})
		.populate('user')
		.populate({
			path: 'detais.product_id',
			select: 'name'
		})
		.exec((err, bills) => {
			return res.send(bills);
		});
});
/*--------------------------------------------------------*/
router.get('/product/add', (req, res, next) => {
	res.render('./admin/pages/add_product', { user: req.user });
});
/*--------------------------------------------------------*/
const cpUpload = upload.fields(
	[
		{ name: 'avatar', maxCount: 1 },
		{ name: 'details', maxCount: 8 }
	]
);
router.post('/product/add/new', cpUpload, (req, res) => {
	let product = new Product({
		name: req.body.product_name,
		unit_price: req.body.unit_price,
		promo_price: req.body.promo_price,
		slug_name: slug(req.body.product_name),
		descript: req.body.description,
		image: req.files['avatar'][0].filename,
		status: req.body.status,
		quantity: req.body.quantity,
		saled: 0,
		category_id: req.body.product_type,
		size: covertToObj(req.body.size),
		colors: covertToObj(req.body.color),
		image_details: _.map(req.files['details'], 'filename'),
		rate: [],
		comment: []
	});
	product.save(function (err, results) {
		if (err) {
			return res.render('./admin/pages/add_product', {
				messages: 'Opps! somethings went wrong',
				user: req.user
			});
		}

		Product.find().sort({ createdOn: -1 }).limit(8)
			.exec((err, products) => {
				req.app.io.emit('adminAddNewProduct', {
					news: products,
				});
			});
		return res.render('./admin/pages/list_product', {
			messages: 'Add product sucessfull!',
			user: req.user
		});
	});
});
/*-------------------------------------------------*/
router.get('/product/edit/:id', (req, res) => {

	res.render('./admin/pages/edit_product', {
		user: req.user,
		productId: req.params.id
	});

});
/*-------------------------------------------------*/
router.post('/product/edit/:id', cpUpload, (req, res) => {
	console.log(req.body);
	let data = {
		name: req.body.product_name,
		unit_price: req.body.unit_price,
		promo_price: req.body.promo_price,
		slug_name: slug(req.body.product_name),
		descript: req.body.description,
		status: req.body.status,
		quantity: req.body.quantity,
		category_id: req.body.product_type,
		size: covertToObj(req.body.size),
		colors: covertToObj(req.body.color),
	};

	if (req.files['avatar']) {
		data.image = req.files['avatar'][0].filename;
	}
	if (req.files['details']) {
		data.$push = { image_details: { $each: _.map(req.files['details'], 'filename') } };
	}

	Product.findByIdAndUpdate(
		req.params.id,
		data,
		{ new: true },
		(err, product) => {
			if (err) {
				return res.render('./admin/pages/edit_product', {
					user: req.user,
					productId: req.params.id,
					status: 500,
					messages: 'Có lỗi xảy ra !'
				});
			}
			return res.render('./admin/pages/list_product', {
				user: req.user,
				messages: 'Cập nhật sản phẩm thành công !'
			});
		}
	);
});
/*-------------------------------------------------*/
router.get('/product/edit-data/:id', (req, res) => {
	Product.findById(req.params.id, (err, product) => {
		res.json({
			productInfor: product,
		});
	});
});
/*-------------------------------------------------*/
router.get('/product/list', (req, res) => {
	res.render('./admin/pages/list_product', { user: req.user });
});

router.get('/product/list-data', (req, res) => {

	async.parallel([
		(callback) => {
			if (req.query.pages != null) {
				Product.find()
					.sort({ createdOn: -1 })
					.limit(6)
					.skip((req.query.pages - 1) * 6)
					.exec((err, listProducts) => {
						callback(null, listProducts);
					});
			} else {
				Product.find()
					.sort({ createdOn: -1 })
					.limit(6)
					.exec((err, listProducts) => {
						callback(null, listProducts);
					});
			}
		},
		(callback) => {
			Product.find().count()
				.exec((err, total_records) => {
					callback(null, total_records);
				});
		}
	],
		(err, results) => {
			res.json({
				products: results[0],
				pages: Math.ceil(results[1] / 6),
				currentPages: (req.query.pages) ? req.query.pages : 1
			});
		}
	);
});
/*------------------------------------------------*/
router.get('/product/remove/:id', (req, res) => {
	Product.findByIdAndRemove(req.params.id, (err, product) => {
		if (err) {
			return res.status(500).json({ message: 'Somethings went wrong' });
		}
		async.parallel([
			(callback) => {
				if (req.query.pages != null) {
					Product.find()
						.sort({ createdOn: -1 })
						.limit(6)
						.skip((req.query.pages - 1) * 6)
						.exec((err, listProducts) => {
							callback(null, listProducts);
						});
				} else {
					Product.find()
						.sort({ createdOn: -1 })
						.limit(6)
						.exec((err, listProducts) => {
							callback(null, listProducts);
						});
				}
			},
			(callback) => {
				Product.find().count()
					.exec((err, total_records) => {
						callback(null, total_records);
					});
			}
		],
			(err, results) => {
				res.status(200).json({
					products: results[0],
					pages: Math.ceil(results[1] / 6),
					currentPages: 1
				});
			}
		);
	});
});
/*--------------------------------------------*/
router.get('/analytic-data', (req, res) => {
	let startDay = new Date(moment().startOf('day'));
	let endDay = new Date(moment().endOf('day'));
	let startWeek = new Date(moment().startOf('week'));
	let endWeek = new Date(moment().endOf('week'));
	let startMonth = new Date(moment().startOf('month'));
	let endMonth = new Date(moment().endOf('month'));

	async.parallel([
		function (callback) {
			Bill.aggregate(
				{ $unwind: '$detais' },
				{
					$match: {
						createdOn: {
							$gt: startDay,
							$lt: endDay
						}
					}
				},
				{
					$group: {
						_id: '$detais.product_name',
						total: { $sum: '$detais.quantity' },
						earned: { $sum: '$detais.price' }
					}
				},
				{ $sort: { total: -1 } }
			)
				.limit(10)
				.exec((err, records) => {
					Product.find({ _id: { $in: records } }, { name: 1 })
						.exec((resu) => {
							callback(null, records);
						});
				});
		},
		function (callback) {
			Bill.aggregate(
				{ $unwind: '$detais' },
				{
					$match: {
						createdOn: {
							$gt: startWeek,
							$lt: endWeek
						}
					}
				},
				{
					$group: {
						_id: '$detais.product_name',
						total: { $sum: '$detais.quantity' },
						earned: { $sum: '$detais.price' },
					}
				},
				{ $sort: { total: -1 } }
			)
				.limit(10)
				.exec((err, records) => {
					callback(null, records);
				});
		},
		function (callback) {
			Bill.aggregate(
				{ $unwind: '$detais' },
				{
					$match: {
						createdOn: {
							$gt: startMonth,
							$lt: endMonth
						}
					}
				},
				{
					$group: {
						_id: '$detais.product_name',
						total: { $sum: '$detais.quantity' },
						earned: { $sum: '$detais.price' },
					}
				},
				{ $sort: { total: -1 } }
			)
				.limit(10)
				.exec((err, records) => {
					callback(null, records);
				});
		},
		function (callback) {
			Bill.aggregate(
				{ $unwind: '$detais' },
				{
					$match: {
						createdOn: {
							$gt: startMonth,
							$lt: endMonth
						}
					}
				},
				{
					$group: {
						_id: '$detais.category_name',
						total: { $sum: '$detais.quantity' },
					}
				},
				{ $sort: { total: -1 } }
			)
				.limit(10)
				.exec((err, records) => {
					callback(null, records);
				});
		}
	],
		function (err, results) {
			if (err) {
				throw new err;
			}
			return res.send({
				days: results[0],
				week: results[1],
				month: results[2],
				chart: results[3],
				daySum: _.sumBy(results[0], function (o) { return o.total; }),
				weekSum: _.sumBy(results[1], function (o) { return o.total; }),
				monthSum: _.sumBy(results[2], function (o) { return o.total; }),
				dayEarn: _.sumBy(results[0], function (o) { return o.earned; }),
				weekEarn: _.sumBy(results[1], function (o) { return o.earned; }),
				monthEarn: _.sumBy(results[2], function (o) { return o.earned; }),
			});
		}
	);
});
/*-------------------------------------------------*/
router.get('/analytic', (req, res) => {
	res.render('./admin/pages/analytic', { user: req.user });
});
/*-----------------------------------------------*/
router.get('/category/list', (req, res) => {
	res.render('./admin/pages/list_category', { user: req.user, status: req.query.status });
});

router.get('/category/list-data', (req, res) => {
	async.parallel([
		(callback) => {
			if (req.query.pages != null) {
				Category.find()
					.sort({ createdOn: -1 })
					.limit(6)
					.skip((req.query.pages - 1) * 6)
					.exec((err, categories) => {
						callback(null, categories);
					});
			} else {
				Category.find()
					.sort({ createdOn: -1 })
					.limit(6)
					.exec((err, categories) => {
						callback(null, categories);
					});
			}
		},
		(callback) => {
			Category.find().count()
				.exec((err, total_records) => {
					callback(null, total_records);
				});
		}
	],
		(err, results) => {
			res.json({
				category: results[0],
				pages: Math.ceil(results[1] / 6),
				currentPages: (req.query.pages) ? req.query.pages : 1
			});
		});
});

router.get('/category/remove/:id', (req, res) => {
	Category.findByIdAndRemove(req.params.id, (err, category) => {
		if (err) return res.status(500).send(err);
		const response = {
			message: 'Category successfully deleted',
			id: category._id,
		};
		async.parallel([
			(callback) => {
				Category.find()
					.sort({ createdOn: -1 })
					.limit(6)
					.exec((err, categories) => {
						callback(null, categories);
					});
			},
			(callback) => {
				Category.find().count()
					.exec((err, total_records) => {
						callback(null, total_records);
					});
			}
		],
			(err, results) => {
				return res.status(200).json({
					category: results[0],
					pages: Math.ceil(results[1] / 6),
					currentPages: 1
				});
			});
	});
});

router.get('/category/update', (req, res) => {
	Category.find({ _id: req.query.id })
		.exec((err, category) => {
			res.render('./admin/pages/update_category', {
				info: category,
				user: req.user,
			});
		});
});


router.post('/category/update/:id', (req, res) => {
	Category.findByIdAndUpdate(
		req.params.id,
		{
			name: req.body.name,
			descript: req.body.descript,
			type: req.body.type
		},
		{ new: true },
		(err, category) => {
			if (err) return res.status(500).send(err);
			res.redirect('/admin/category/list?status=200');
		}
	);
});

router.get('/user/list', (req, res) => {
	res.render('./admin/pages/user_list', {
		user: req.user
	});
});

router.get('/user/update/:id', (req, res) => {
	User.findById(req.params.id, (err, info) => {
		return res.render('./admin/pages/edit_user', { user: req.user, info: info });
	});
});

router.get('/user/list/data', (req, res) => {
	async.parallel([
		(callback) => {
			if (req.query.pages != null) {
				User.find()
					.sort({ createdOn: -1 })
					.limit(6)
					.skip((req.query.pages - 1) * 6)
					.exec((err, users) => {
						callback(null, users);
					});
			} else {
				User.find()
					.sort({ createdOn: -1 })
					.limit(6)
					.exec((err, users) => {
						callback(null, users);
					});
			}
		},
		(callback) => {
			User.find().count()
				.exec((err, total_records) => {
					callback(null, total_records);
				});
		}
	],
		(err, results) => {
			res.json({
				users: results[0],
				pages: Math.ceil(results[1] / 6),
				currentPages: (req.query.pages) ? req.query.pages : 1
			});
		});
});

router.get('/user/remove/:id', (req, res) => {
	User.findByIdAndRemove(req.params.id, (err, user) => {
		if (err) return res.status(500).send(err);
		const response = {
			message: 'User successfully deleted',
			id: user._id,
		};
		async.parallel([
			(callback) => {
				User.find()
					.sort({ createdOn: -1 })
					.limit(6)
					.exec((err, user) => {
						callback(null, user);
					});
			},
			(callback) => {
				User.find().count()
					.exec((err, total_records) => {
						callback(null, total_records);
					});
			}
		],
			(err, results) => {
				return res.status(200).json({
					users: results[0],
					pages: Math.ceil(results[1] / 6),
					currentPages: 1
				});
			});
	});
});

router.get('/notifications', (req, res) => {
	User.find({ _id: req.user._id }, { _id: 1, notification: 1 })
		.exec((err, notifications) => {
			if (err) {
				return res.status(200).json({
					notis: [{ content: 'There is some errors to fetch data' }]
				});
			}
			return res.status(200).json({
				notis: notifications[0].notification
			});
		});
});


router.post('/notifications/add', (req, res) => {
	User.findByIdAndUpdate(
		req.user._id,
		{ $push: { notification: { content: req.body.content } } },
		{ safe: true, upsert: true },
		(err, notis) => {
			return res.status(200).json({
				message: 'added'
			});
		}
	);
});


router.get('/notifications/watched/:id', (req, res) => {
	User.update(
		{ _id: req.user._id },
		{ $pull: { notification: { _id: req.params.id } } }
		, (err, notifications) => {
			User.find({ _id: req.user._id }, { _id: 1, notification: 1 })
				.exec((err, notifications) => {
					if (err) {
						return res.status(200).json({
							notis: [{ content: 'There is some errors to fetch notifictions' }]
						});
					}
					return res.status(200).json({
						notis: notifications[0].notification,
					});
				});
		});
});

router.get('/user/add', (req, res) => {
	res.render('./admin/pages/add_user', { user: req.user });
});

router.post('/user/add', (req, res) => {
	let user = new User({
		username: req.body.username,
		address: req.body.useraddress,
		email: req.body.useremail,
		password: req.body.password,
		phone: req.body.userphone,
		role: req.body.userRight,
	});
	user.save(function (err, results) {
		if (err) {
			return res.status(500).send({
				status: 'Error'
			});
		}
		return res.status(200).send({
			status: 'Inserted'
		});
	});
});

router.get('/messages/index', (req, res) => {
	res.render('./admin/pages/messages', { user: req.user });
});

router.get('/bills/single/detail/:id', (req, res) => {
	Bill.findById(req.params.id)
		.populate({
			path: 'user',
			select: 'username'
		}).exec((err, billDetails) => {
			res.render('./admin/pages/bill_details', {
				user: req.user,
				bill: billDetails
			});
		})
});

router.get('/bills/single/detail-data/:id', (req, res) => {
	Bill.findById(req.params.id)
		.populate({
			path: 'detais.product_id',
			select: [
				'image',
				'colors',
				'size',
				'unit_price',
				'promo_price'
			]
		})
		.exec((err, billDetails) => {
			return res.status(200).json({
				bill: billDetails
			})
		})
});

/* router.patch('/bills/single/update/item', (req, res) => {
	new Promise((resolve, reject) => {
		Bill.findById(req.body.billId, (err, bill) => {
			if (err) {
				reject(err);
			} else {
				detail = _.filter(bill.detais,
					{
						product_id: req.body.dataUpdate[0].product_id,
					});
				qty = req.body.dataUpdate[0].quantity - detail[0].quantity;
				resolve(parseInt(qty));
			}
		});
	}).then((qty) => {
		async.parallel(
			[
				(callback) => {
					Bill.findOneAndUpdate(
						{ _id: req.body.billId, 'detais._id': req.body.itemId },
						{ $set: { detais: req.body.dataUpdate } },
						{ new: true }
					)
						.populate({
							path: 'detais.product_id',
							select: [
								'image',
								'colors',
								'size'
							]
						})
						.exec((err, detail) => {
							if (err) {
								return res.send({
									status: 500,
									message: 'false'
								});
							}
							return res.json({
								status: 200,
								bill: detail
							});
						});
				},
				(callback) => {
					Product.update(
						{
							_id: req.body.dataUpdate[0].product_id,
							'colors.code': req.body.dataUpdate[0].colors,
							'size.code': req.body.dataUpdate[0].size
						},
						{
							$inc: {
								quantity: -qty,
								saled: qty,
								'colors.$.quantity': -qty,
								'size.$.quantity': -qty
							}
						},
						(err, product) => {
							if (err) {
								return res.send({
									status: 500,
									message: 'false'
								});
							}
							callback(null, product);
						}
					);
				}
			],
			(err, results) => {
				return res.json({
					status: 200,
					bill: results[0]
				});
			}
		);
	}).catch((err) => {
		return res.send({
			status: 500,
			message: 'false'
		});
	});
});
 */
router.patch('/bills/single/update/item/:bill', (req, res) => {
	let path = `detais.${req.body.index}.quantity`;
	Bill.findByIdAndUpdate(
		req.params.bill,
		{
			$inc: {
				[path]: req.body.changedQty,
			}
		},
		{ new: true },
		(err, bill) => {
			if (err) {
				return res.json({
					status: 500
				});
			}

			Product.findById(
				req.body.productId,
				(err, product) => {
					if (err) {
						return res.json({
							status: 500
						});
					}
					let cIndex = _.findIndex(product.colors, ['code', req.body.color]);
					let sIndex = _.findIndex(product.size, ['code', req.body.size]);

					let cpath = `colors.${cIndex}.quantity`;
					let spath = `size.${sIndex}.quantity`;
					Product.findByIdAndUpdate(
						req.body.productId,
						{
							$inc: {
								quantity: -req.body.changedQty,
								[cpath]: -req.body.changedQty,
								[spath]: -req.body.changedQty
							}
						},
						(err, prd) => {
							if (err) {
								return res.json({
									status: 500
								});
							}

							return res.json({
								status: 200
							});
						}
					);
				}
			);
		}
	);
});



router.delete('/bills/:id', (req, res) => {
	Bill.findById(req.params.id, (err, bill) => {
		if (err) {

			return res.send({
				status: 500,
				message: 'false'
			});
		} else {
			async.eachSeries(bill.detais, (item, done) => {
				let qty = parseInt(item.quantity);

				new Promise((resolve, reject) => {
					Product.findById(item.product_id, (err, prd) => {
						if (err) {
							reject();
						} else {

							resolve({
								sIndex: _.findIndex(prd.size, ['code', item.size]),
								cIndex: _.findIndex(prd.colors, ['code', item.colors])
							});
						}
					})
				}).then((path) => {
					let cpath = `colors.${path.cIndex}.quantity`;
					let spath = `size.${path.sIndex}.quantity`;
					Product.update(
						{
							_id: item.product_id,
							'colors.code': item.colors,
							'size.code': item.size
						},
						{
							$inc: {
								quantity: qty,
								saled: -qty,
								[cpath]: qty,
								[spath]: qty
							}
						},
						(err, product) => {
							done();
						}
					);

				});
			}, (err) => {
				Bill.findByIdAndRemove(req.params.id, (err, result) => {
					if (err) {
						return res.json({
							status: 500,
							message: 'fasle'
						});
					}
					return res.json({
						status: 200,
						messages: 'success'
					});
				});
			});
		}
	});
});

router.patch('/bills/update/color', (req, res) => {
	new Promise((resolve, reject) => {
		Bill.findById(req.body.billId, (err, bill) => {
			if (err) {
				return reject();
			}
			let cpath = `detais.${req.body.index}.colors`;
			Bill.findByIdAndUpdate(
				req.body.billId,
				{ [cpath]: req.body.color },
				{ new: true },
				() => {
					if (err) {
						return reject();
					}

					return resolve(200);
				}
			);

		})
	}).then((status) => {
		return res.json({
			status: 200,
			messages: 'Sucessfull update color'
		});
	})
		.catch((err) => {
			return res.json({
				status: 500,
				messages: 'Opps! something went wrong'
			});
		});
});

router.patch('/bills/update/size', (req, res) => {
	new Promise((resolve, reject) => {
		Bill.findById(req.body.billId, (err, bill) => {
			if (err) {
				return reject();
			}
			let cpath = `detais.${req.body.index}.size`;

			Bill.findByIdAndUpdate(
				req.body.billId,
				{ [cpath]: req.body.size },
				{ new: true },
				() => {
					if (err) {
						return reject();
					}

					return resolve(200);
				}
			);

		})
	}).then((status) => {
		return res.json({
			status: 200,
			messages: 'Sucessfull update size'
		});
	})
		.catch((err) => {
			return res.json({
				status: 500,
				messages: 'Opps! something went wrong'
			});
		});
});


router.patch('/bills/validate/quantity', (req, res) => {
	Product.findById(req.body.productId, (err, product) => {
		if (err) {
			return res.json({
				status: 500,
				messages: 'Có lỗi xảy ra khi kiểm tra số lượng sản phẩm !'
			});
		}

		let colorQty = _.find(product.colors, ['code', req.body.color]).quantity;
		let sizeQty = _.find(product.size, ['code', req.body.size]).quantity;
		let avg = (colorQty <= sizeQty) ? colorQty : sizeQty;

		if (avg < req.body.newQuantity) {
			return res.json({
				status: 502,
				messages: `Sản phẩm này hiện chỉ có sẵn ${avg} sản phẩm!`
			});
		} else {
			return res.json({
				status: 200,
				messages: `Số lượng hợp lệ`
			});
		}
	});
});



router.patch('/bills/single/remove/item/:id', (req, res) => {

	new Promise((resolve, reject) => {
		Product.findById(req.body.productId, (err, prd) => {
			if (err) {
				reject();
			} else {

				resolve({
					sIndex: _.findIndex(prd.size, ['code', req.body.size]),
					cIndex: _.findIndex(prd.colors, ['code', req.body.color])
				});
			}
		})
	}).then((path) => {
		let cpath = `colors.${path.cIndex}.quantity`;
		let spath = `size.${path.sIndex}.quantity`;
		Product.update(
			{ _id: req.body.productId, 'colors.code': req.body.color, 'size.code': req.body.size },
			{
				$inc: {
					quantity: req.body.qty,
					saled: -req.body.qty,
					[cpath]: req.body.qty,
					[spath]: req.body.qty
				}
			},
			(err, product) => {
				if (err) {
					throw new Error;
				}
				Bill.findByIdAndUpdate(
					req.params.id,
					{ $pull: { 'detais': { 'product_id': req.body.productId } } },
					{ new: true }
				)
					.populate({
						path: 'detais.product_id',
						select: [
							'image',
							'colors',
							'size'
						]
					})
					.exec((err, detail) => {
						if (err) {
							return res.send({
								status: 500,
								message: 'false'
							});
						}
						return res.send({
							status: 200,
							bill: detail
						});
					});
			}
		);
	});
});


router.patch('/bills/single/update/status/:id', (req, res) => {
	Bill.findByIdAndUpdate(
		req.params.id,
		{ status: req.body.status },
		{ new: true },
		(err, detail) => {
			if (err) {
				return res.send({
					status: 500,
					message: 'false'
				});
			}
			return res.send({
				status: 200,
				bill: detail
			});
		}
	);
});

router.get('/bills/export/:id', (req, res) => {
	Bill.findById(req.params.id)
		.populate('user')
		.exec((err, billInfo) => {
			console.log(billInfo);
			res.render('./admin/pages/bill_print', {
				user: req.user,
				bill: billInfo
			});
		});
});

router.get('/product/report', (req, res) => {
	console.log(moment());
	res.render('./admin/pages/analytic_product', { user: req.user });
});

router.get('/product/report/data', (req, res) => {
	Product.find({ quantity: { $gt: 0 } }, { name: 1, quantity: 1, saled: 1, image: 1 })
		.sort({ quantity: -1 })
		.limit(50)
		.exec((err, allProducts) => {
			if (err) {
				res.json({
					status: 500,
					messages: 'False'
				});
			}
			res.json({
				products: allProducts
			});
		});
});

router.get('/product/report/out-of-data', (req, res) => {
	Product.find({ quantity: { $lt: 10, $gt: 0 } }, { name: 1, quantity: 1, saled: 1, image: 1 })
		.sort({ quantity: -1 })
		.limit(50)
		.exec((err, allProducts) => {
			if (err) {
				res.json({
					status: 500,
					messages: 'False'
				});
			}
			res.json({
				products: allProducts
			});
		});
});

router.get('/product/report/inventory-data', (req, res) => {
	Product.find({ quantity: { $lt: 1 } })
		.exec((err, allProducts) => {
			if (err) {
				res.json({
					status: 500,
					messages: 'False'
				});
			}
			res.json({
				products: allProducts
			});
		});
});

router.get('/chatbox/online', (req, res) => {
	User.find({ status: config.activity.online })
		.exec((err, users) => {
			res.json({
				onlineUsers: users,
				user: req.user
			});
		});
});

router.post('/chatbox/message/fetch', (req, res) => {
	Message.find({ members: { $all: [req.user._id, req.body.userId] } })
		.exec((err, messages) => {
			if (err) {
				return res.status(500).json({
					messages: err.code
				});
			}
			return res.status(200).json({
				conversation: (messages.length !== 0) ? messages : [{ messages: [{ message: 'Hãy bắt đầu trò chuyện...' }] }]
			});
		});
});


router.post('/chatbox/add/message', (req, res) => {

	Message.find({ members: { $all: [req.body.curentId, req.body.targetId] } })
		.exec((err, message) => {
			if (message.length !== 0) {
				Message.findOneAndUpdate(
					{ members: { $all: [req.body.curentId, req.body.targetId] } },
					{
						$push:
							{
								messages:
									{
										user_name: req.body.username,
										status: 1,
										message: req.body.message
									}
							}
					},
					{ new: true },
					(err, messages) => {
						req.app.io.emit('newMessage', {
							messages: messages,
						});

						return res.status(200).json({
							messages: messages
						});
					}
				);
			} else {
				let message = new Message({
					members: [req.body.curentId, req.body.targetId],
					messages: [
						{
							user_name: req.body.username,
							status: 1,
							message: req.body.message
						}
					],
				});
				message.save((err, messages) => {
					if (err) {
						throw new err
					}
					req.app.io.emit('newMessage', {
						messages: messages,
					});
					return res.status(200).json({
						messages: {
							messages: [{
								user_name: req.body.username,
								status: 1,
								message: req.body.message
							}]
						}
					});
				});
			}
		});
});

router.get('/post/create', (req, res) => {
	res.render('./admin/pages/create_post', { user: req.user });
});

router.post('/post/create', cpUpload, (req, res) => {
	blog = new Blog({
		title: req.body.title,
		content: req.body.content,
		avata: req.files['avatar'][0].filename,
		comment: [],
		user: req.user._id,
	});

	blog.save((err, result) => {
		if (err) {
			return res.status(500).json({
				messages: err.code
			});
		} else {
			return res.redirect('/admin/post/list');
		}
	});
});

router.get('/post/list', (req, res) => {
	res.render('./admin/pages/post_list', { user: req.user });
});

router.post('/post/update/:id', cpUpload, (req, res) => {
	let data = {
		title: req.body.title,
		content: req.body.content,
	};
	if (req.files['avatar']) {
		data = {
			title: req.body.title,
			content: req.body.content,
			avata: req.files['avatar'][0].filename,
		};
	}

	Blog.findByIdAndUpdate(
		req.params.id,
		data,
		(err, blog) => {
			if (err) {
				return res.render('./admin/pages/post_edit', {
					messages: 'Có lỗi xảy ra',
					user: req.user,
					id: req.params.id
				});
			}
			return res.redirect('/admin/post/list');
		}
	);
});


router.get('/post/list/data', (req, res) => {
	async.parallel([
		(callback) => {
			if (req.query.pages !== null) {
				Blog.find()
					.sort({ createdOn: -1 })
					.limit(6)
					.skip((req.query.pages - 1) * 6)
					.exec((err, blogs) => {
						callback(null, blogs);
					});
			} else {
				Blog.find()
					.sort({ createdOn: -1 })
					.limit(6)
					.exec((err, blogs) => {
						callback(null, blogs);
					});
			}
		},
		(callback) => {
			Blog.find().count()
				.exec((err, total_records) => {
					callback(null, total_records);
				});
		}
	],
		(err, results) => {
			return res.status(200).json({
				blogs: results[0],
				pages: Math.ceil(results[1] / 6),
				currentPages: 1
			});
		});

});

router.delete('/post/remove/:id', (req, res) => {
	Blog.findByIdAndRemove(req.params.id, (err, blog) => {
		if (err) return res.status(500).send(err);
		const response = {
			message: 'Post successfully deleted',
			id: blog._id,
		};
		async.parallel([
			(callback) => {
				Blog.find()
					.sort({ createdOn: -1 })
					.limit(6)
					.exec((err, categories) => {
						callback(null, categories);
					});
			},
			(callback) => {
				Blog.find().count()
					.exec((err, total_records) => {
						callback(null, total_records);
					});
			}
		],
			(err, results) => {
				return res.status(200).json({
					blogs: results[0],
					pages: Math.ceil(results[1] / 6),
					currentPages: 1
				});
			});
	});
});

router.get('/post/edit/:id', (req, res) => {
	res.render('./admin/pages/post_edit', { user: req.user, id: req.params.id });
});


router.get('/post/edit/data/:id', (req, res) => {
	console.log(req.params.id);
	Blog.findById(req.params.id, (err, blog) => {
		if (err) {
			//	console.log(err);
			return res.json({
				status: 500,
				messages: 'false'
			});
		}
		return res.json({
			status: 200,
			post: blog
		});
	});
});

router.post('/analytic/start-end', (req, res) => {
	async.parallel(
		[
			(callback) => {
				Bill.aggregate(
					{ $unwind: '$detais' },
					{
						$match: {
							createdOn: {
								$gt: new Date(req.body.startDay),
								$lt: new Date(req.body.endDay)
							}
						}
					},
					{
						$group: {
							_id: '$detais.category_name',
							total: { $sum: '$detais.quantity' },
						}
					},
					{ $sort: { total: -1 } }
				)
					.limit(10)
					.exec((err, records) => {
						if (err) {
							console.log(err);
						}
						callback(null, records);
					});
			},
			(callback) => {
				Bill.aggregate(
					{ $unwind: '$detais' },
					{
						$match: {
							createdOn: {
								$gt: new Date(req.body.startDay),
								$lt: new Date(req.body.endDay)
							}
						}
					},
					{
						$group: {
							_id: '$detais.product_name',
							total: { $sum: '$detais.quantity' },
							earned: { $sum: '$detais.price' }
						}
					},
					{ $sort: { total: -1 } }
				)
					.limit(10)
					.exec((err, records) => {
						if (err) {
							console.log(err);
						}
						Product.find({ _id: { $in: records } }, { name: 1 })
							.exec((err, rec) => {
								callback(null, records);
							});
					});
			}

		], (err, results) => {
			res.json({
				chart: results[0],
				topProducts: results[1],
				summary: _.sumBy(results[1], function (o) { return o.total; }),
				earn: _.sumBy(results[1], function (o) { return o.earned; }),
			});
		});


});


router.post('/user/update', (req, res) => {

	User.findByIdAndUpdate(
		req.body.id,
		{
			username: req.body.username,
			address: req.body.address,
			email: req.body.email,
			phone: req.body.phone,
			role: req.body.role,
		},
		{ new: true },
		(err, user) => {
			if (err) {
				console.log(err);
				return res.json({
					status: 500,
					messages: 'Opps! there is something went wrong'
				});
			}

			res.json({
				status: 200,
				user: user
			});
		}
	);
});

router.get('/user/info/:id', (req, res) => {
	User.findById(req.params.id, (err, userInfo) => {
		if (err) {
			return res.json({
				status: 500,
				messages: 'Opps! there is something went wrong'
			});
		}

		return res.json({
			status: 200,
			user: userInfo
		});
	});
});

router.get('/product/find/:keyword', (req, res) => {
	Product.find({ name: { $regex: req.params.keyword, $options: '-i' } })
		.exec((err, product) => {
			if (err) {
				throw new Error;
			}
			return res.json({
				result: product
			});
		});
});

router.get('/report/list', (req, res) => {
	Report.find({})
	.sort({ createdOn : -1 })
	.exec(
		(err, reports) => {
			if(err){
				return res.redirect('back');
			}
			return res.render('./admin/pages/list_report', { user: req.user, reports: reports });
		}
	);
});

module.exports = router;
