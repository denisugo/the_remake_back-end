const createError = require("http-errors");
const express = require("express");
const path = require("path");
const logger = require("morgan");
const session = require("express-session");
const passport = require("passport");
const cors = require("cors");
const authSetup = require("./auth/index"); // Should execute passport.use code

const swaggerJsdoc = require("swagger-jsdoc");
const swaggerUi = require("swagger-ui-express");

const productsRouter = require("./routes/products");
const usersRouter = require("./routes/users");
const loginRouter = require("./routes/login");
const registerRouter = require("./routes/register");

require("dotenv").config();

const app = express();

// basic setup
app.use(cors({ origin: process.env.ORIGIN, credentials: true }));
app.use(logger("dev"));
app.use(
  session({
    secret: process.env.SECRET_ENCRYPTION_KEY || "default",
    resave: false,
    saveUninitialized: false,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(passport.initialize());
app.use(passport.session());

// endpoints
app.use("/api/v1/products", productsRouter);
app.use("/api/v1/users", usersRouter);
app.use("/api/v1/login", loginRouter);
app.use("/api/v1/register", registerRouter);

// documentation
const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Portfolio API",
      version: "0.1.0",
      description:
        "This is a simple CRUD API application made with Express and documented with Swagger",
      license: {
        name: "None",
      },
      contact: {
        name: "mock",
        url: "https://mock.com",
        email: "info@email.com",
      },
    },
    servers: [
      {
        url: "http://localhost:3000/api/v1",
      },
    ],
  },
  apis: [
    "./routes/login.js",
    "./routes/register.js",
    "./routes/users.js",
    "./routes/products.js",
    "./routes/orders.js",
    "./routes/checkout.js",
    "./routes/cart.js",
  ],
};

const specs = swaggerJsdoc(options);
app.use("/api/docs", swaggerUi.serve, swaggerUi.setup(specs));

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
});

module.exports = app;
