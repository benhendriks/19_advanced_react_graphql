require("dotenv").config({
  path: "variables.env",
});

const createServer = require("./createServer");
const db = require("./db");

const server = createServer();

//Todo create express middleware to hanlde cookies (JWT)
//Todo create express middleware to populate current user

server.start(
  {
    cors: {
      credentials: true,
      origin: process.env.FRONTEND_URL,
    },
  },
  (deets) => {
    console.log(`Server is running on port http:/localhost:${deets.port}`);
  }
);
