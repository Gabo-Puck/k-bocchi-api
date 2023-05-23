require("dotenv").config();

var createError = require("http-errors");
var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");
var cors = require("cors");
var indexRouter = require("./routes/index");
var usuario = require("./routes/usuario");
var { knex } = require("./setup/knexfile");

var { Model } = require("objection");
Model.knex(knex);
const swaggerSpec = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "K-Bocchi API",
      description:
        "API para interactuar con la base de datos y sistemas relacionados",
      version: "1.0.0",
    },
  },
  apis: [
    `${path.join(__dirname, "./routes/*.js")}`,
  ],
};
var app = express();

const admin = require("firebase-admin");
const serviceAccount = require("./kbocchi-1254b-firebase-adminsdk-9ltt9-16cf6fa56d.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));
app.use(cors());
app.use("/", indexRouter);
app.use("/usuarios", usuario);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};
  // render the error page
  res.status(err.status || 500);
  res.render("error");
});

module.exports = app;
