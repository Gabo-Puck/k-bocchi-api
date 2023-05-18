var express = require("express");
var router = express.Router();
var { Usuario } = require("../Models/Usuario");
const {encriptar,desencriptar} = require("../utils/encryption")
const { getAuth } = require("firebase-admin/auth");

/* GET home page. */
router.get("/", function (req, res, next) {
  res.render("index", { title: "Express" });
});

router.get("/usuarios", (req, res, next) => {
  console.log("x");
  Usuario.query().then((usuarios) => res.json(usuarios));
});

router.get("/gabo", (req, res, next) => {
  console.log(req.query.uid);
  getAuth()
    .getUser(req.query.uid)
    .then((record) => res.json(record));
});

router.post("/encriptar",(req,res,next)=>{
  let {data} = req.body;
  let enc = encriptar(data);
  res.json(enc);
})
router.post("/desencriptar",(req,res,next)=>{
  let {data} = req.body;
  let desencriptado = desencriptar(data);
  res.json(desencriptado);
  
})

module.exports = router;
