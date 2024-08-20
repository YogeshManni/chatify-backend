var express = require("express");
var router = express.Router();

/* GET home page. */
router.get("/", async function (req, res, next) {
  res.status(200).send("Welcome to Chatify !!");
});

module.exports = router;
