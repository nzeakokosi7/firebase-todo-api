import * as functions from "firebase-functions";
import admin = require("firebase-admin");

// eslint-disable-next-line @typescript-eslint/no-var-requires
const express = require("express");
// eslint-disable-next-line @typescript-eslint/no-var-requires
const cors = require("cors");
// eslint-disable-next-line @typescript-eslint/no-var-requires
const bodyParser = require("body-parser");
// eslint-disable-next-line @typescript-eslint/no-var-requires,max-len
const {userCreationMiddleWare, userAuthMiddleWare, authMiddleWare} = require("./middlewares");
// eslint-disable-next-line @typescript-eslint/no-var-requires,max-len
const {createUser, authenticateUser, createTodo, getTodos, getTodosById, updateTodo, completeTodo} = require("./routes");

const app = express();
app.use(cors({origin: true}));
app.use(bodyParser.json());
admin.initializeApp(functions.config().firebase);

// eslint-disable-next-line max-len
app.post("/user/register", userCreationMiddleWare, createUser);

// eslint-disable-next-line max-len
app.post("/user/login", userAuthMiddleWare, authenticateUser);

// eslint-disable-next-line max-len
app.post("/todos/", authMiddleWare, createTodo);

// eslint-disable-next-line max-len
app.get("/todos/", authMiddleWare, getTodos);

// eslint-disable-next-line max-len
app.get("/todos/:id", authMiddleWare, getTodosById);

// eslint-disable-next-line max-len
app.get("/todos/complete/:id", authMiddleWare, completeTodo);

// eslint-disable-next-line max-len
app.put("/todos/:id", authMiddleWare, updateTodo);

exports.widgets = functions.https.onRequest(app);


