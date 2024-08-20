var express = require("express");
var router = express.Router();
var dbEvents = require("../db/db-users");
var bcrypt = require("bcrypt");
var fs = require("fs");
const multer = require("multer");

let _dbo = null;

function getDbo() {
  if (!_dbo) {
    _dbo = new dbEvents(global.db);
  }
  return _dbo;
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadPath = "public/profiles";
    if (!fs.existsSync(uploadPath))
      fs.mkdirSync(uploadPath, { recursive: true });
    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    let filename = req.body.name + file.originalname;
    filename = filename.replaceAll(":", "-");
    cb(null, filename);
  },
});
const upload = multer({ storage: storage });

router.post(
  "/uploadImage",
  upload.fields([{ name: "image-file", maxCount: 1 }]),
  async function (req, res) {
    try {
      console.log("file uploaded");
      res.status(200).json({
        status: "success",
        message: "File created successfully!!",
      });
    } catch (err) {
      console.log(err);
      res.status(500).send(err.message);
    }
  }
);

router.post("/addUser", async (req, res, next) => {
  try {
    const salt = await bcrypt.genSalt(10);
    req.body.password = await bcrypt.hash(req.body.password, salt);
    const response = await getDbo().addUser(req.body);
    res
      .status(200)
      .json({ status: "success", message: "Account created successfully!" });
  } catch (err) {
    console.log(err);
    res.status(500).json({ status: "failed", message: "Error occured" });
  }
});

router.get("/getUsers", async (req, res, next) => {
  try {
    const response = await getDbo().getUsers();
    res.status(200).send(response);
  } catch (err) {
    console.log(err);
    res.status(500).send(err.message);
  }
});

router.post("/login", async (req, res, next) => {
  try {
    const user = await getDbo().getUser(req.body);
    if (user.length == 0 || user == null) {
      res.status(200).json({ status: "not_found", message: "User not found" });
      return;
    }
    const hash = await bcrypt.compare(req.body.password, user[0].password);
    if (!hash) {
      res.status(200).json({ status: "incorrect", message: "User not found" });
      return;
    }

    res.status(200).json({
      status: "success",
      message: "logged in successfully",
      data: user[0],
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({ status: "internal_error" });
  }
});

router.post("/updateUserdata", async (req, res, next) => {
  try {
    const response = await getDbo().updateUser(req.body);
    res
      .status(200)
      .json({
        status: "success",
        message: "User data updated successfully!",
        data: response[0],
      });
  } catch (err) {
    console.log(err);
    res.status(500).json({ status: "failed", message: "Error occured" });
  }
});

module.exports = router;
