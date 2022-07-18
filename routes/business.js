const express = require("express");
const businessRoute = express.Router();
const { body, query, param } = require("express-validator");
const mongoose = require("mongoose");
const validationMW = require("../middlewares/validationMW");
const authMW = require("../middlewares/isAuthenticated");

// ----------Testing
require("../models/business");
let Business = mongoose.model("business");

// ---------

// Deleting an image
const fs = require("fs");
const { promisify } = require("util");
const unlinkAsync = promisify(fs.unlink);

const multer = require("multer");

const multerStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "images/business");
  },
  filename: (req, file, cb) => {
    const ext = file.mimetype.split("/")[1];
    cb(null, `business-${req.id + "-" + Date.now()}.${ext}`);
  },
});

const upload = multer({
  storage: multerStorage,
});

const {
  getAllBusinesses,
  getBusinessById,
  addBusiness,
  updateBusiness,
  updateImage,
} = require("../controllers/business");

businessRoute
  .route("/business")
  .get(getAllBusinesses)
  .post(authMW, addBusiness)
  .put(
    authMW,
    [
      body("name").optional().isString().withMessage("name should be a string"),
      body("description")
        .optional()
        .isString()
        .withMessage("description should be string"),
    ],
    validationMW,
    updateBusiness
  );

businessRoute
  .route("/business/:id")
  .get(
    authMW,
    [
      param("id")
        .notEmpty()
        .isMongoId()
        .withMessage("User'is id should be a valid MongoID"),
    ],
    validationMW,
    getBusinessById
  );

businessRoute.route("/business/upload").put(
  authMW,
  (req, res, next) => {
    Business.findOne({ userId: req.id })
      .then(async (data) => {
        await unlinkAsync(data.imageLink);
      })
      .catch((err) => {
        next(err);
      });
    next();
  },
  upload.single("photo"),
  updateImage
);

module.exports = businessRoute;
