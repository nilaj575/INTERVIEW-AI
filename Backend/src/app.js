const express = require("express");
const app = express();

const cookieParser = require("cookie-parser");
const cors = require("cors");

const allowedOrigins = [
  "http://localhost:5173",
  "https://interview-ai-nilaj.vercel.app",
];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  })
);

app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));

const authrouter = require("./routes/auth.routes");
const interViewRouter = require("./routes/interview.routes");

app.get("/", (req, res) => {
  res.send("Hello, World!");
});

app.use("/api/auth", authrouter);
app.use("/api/interview", interViewRouter);

module.exports = app;