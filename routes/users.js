var express = require('express');
var router = express.Router();
const { verifyToken } = require('../middlewares/verifytoken');
const { register, verify, login, logout, deleteUser, addphone, transformation } = require("../controllers/authController");
const {optimizeAndPrepare, upload}= require("../middlewares/uplod")


router.post("/register", register);
router.post("/verify", verify);
router.post("/addphone", verifyToken, addphone);
router.post("/optimize", verifyToken,upload.single("file"), optimizeAndPrepare, transformation);
router.post("/login", login);
router.post("/logout", logout);
router.delete("/delete", verifyToken, deleteUser);
module.exports = router;
