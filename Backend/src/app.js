const express = require("express");
const path = require("path");
const app = express();

const cookieParser = require("cookie-parser");
const cors = require("cors");

const allowedOrigins = [
  "http://localhost:5173",
];

app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
  })
);

app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));

app.get("/.well-known/appspecific/com.chrome.devtools.json", (_req, res) => {
  res.json({});
});

const authrouter = require("./routes/auth.routes");
const interViewRouter = require("./routes/interview.routes");

const frontendPath = path.join(__dirname, "../../Frontend/dist");

app.use(express.static(frontendPath));


app.use("/api/auth", authrouter);
app.use("/api/interview", interViewRouter);

module.exports = app;