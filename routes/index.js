var express = require("express");
var router = express.Router();
var { Usuario } = require("../Models/Usuario");
const { encriptar, desencriptar } = require("../utils/encryption");
const { getAuth } = require("firebase-admin/auth");
const swaggerUI = require("swagger-ui-express");
const swaggerJSDOC = require("swagger-jsdoc");
const  path = require("path");



module.exports = router;
