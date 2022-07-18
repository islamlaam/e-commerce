require('../models/product');

const mongoose = require('mongoose');
const product = require('../models/product');

let Products = mongoose.model('product');
const fs = require('fs');
const path = require('path');

module.exports.getAllProducts = (req, res, next) => {
Products.find({})
.then((data) => {
  res.status(200).json({ status: "success", data });
})
.catch((error) => next(error));
};

module.exports.addProduct = (req, res, next) => {
  if (req.role === "admin" || req.role === "business") {
    let newProduct = new Products({
      name: req.body.name,
      description: req.body.description,
      price: req.body.price,
      quantity: req.body.quantity,
      // imageLink: req.body.image,
      businessId: req.body.businessId,
      category: req.body.category,
    });
    newProduct
      .save()
      .then((data) => {
        res.status(201).json({ status: "success", message: "product added" });
      })
      .catch((err) => next(err));
  } else {
    res.status(401).json({
      status: false,
      message: "You are not authorized",
    });
  }
};

module.exports.updateProduct = async (req, res, next) => {
  const toUpdateProduct = await Products.find({ _id: req.body.id });
  try {
    if (
      req.role === "admin" ||
      (req.role === "business" && req.id == toUpdateProduct.businessId)
    ) {
      for (prop in req.body) {
        toUpdateProduct[prop] = req.body[prop];
      }
      return toUpdateProduct.save().then(() => {
        res.status(200).json({
          status: "success",
          message: "product updated",
        });
      });
    } else {
      res.status(401).json({
        status: false,
        message: "You are not authorized",
      });
    }
  } catch (err) {
    next(err);
  }

};

module.exports.getOneProduct = (req, res, next) => {
    Products.findOne({ _id: req.params.id })
    .then((data) => {
      res.status(200).json({ status: "success", data });
    })
    .catch((err) => next(err));
};

module.exports.deleteOneProduct = (req, res, next) => {

  if (
    req.role === "admin" ||
    (req.role === "business" && req.id == req.params.id)
  ) {
    Products.deleteOne({ _id: req.params.id })
      .then((data) => {
        res.status(200).json({ status: "success", message: "product deleted" });
      })
      .catch((err) => next(err));
  } else {
    res.status(401).json({
      status: false,
      message: "You are not authorized",
    });
  }

module.exports.checkForBusinessValidity = async (req, res, next) => {
	const productId = req.params.id;
	try {
		const product = await Products.find({ _id: productId });
		if (product && product.businessId === req.id) next();
	} catch (err) {
		res.status(404).json({
			sucess: false,
			message: 'something went wrong, please try again',
		});
	}
};

module.exports.deleteimage = (req, res, next) => {
	const productId = req.params.id;
	const imagePath = path.join('images', 'products', productId, req.body.imageName);
	fs.unlinkSync(imagePath, (err) => console.log('error : ', err));
