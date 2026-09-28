const express = require("express");
const path = require("path");
const cookieParser = require("cookie-parser");
const cors = require("cors");

const app = express();

const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:3000",
  process.env.FRONTEND_URL,
].filter(Boolean);

app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests without an Origin
      if (!origin) {
        return callback(null, true);
      }

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      // In production, allow the deployed frontend
      if (process.env.NODE_ENV === "production") {
        return callback(null, true);
      }

      return callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
  })
);

app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));

// Chrome DevTools
app.get(
  "/.well-known/appspecific/com.chrome.devtools.json",
  (_req, res) => {
    res.json({});
  }
);

// Frontend
const frontendPath = path.join(__dirname, "../../Frontend/dist");

app.use(express.static(frontendPath));

// Backend routes
const authrouter = require("./routes/auth.routes");
const interViewRouter = require("./routes/interview.routes");

app.use("/api/auth", authrouter);
app.use("/api/interview", interViewRouter);

// React/Vite fallback
app.get("/", (req, res) => {
  if (req.path.startsWith("/api/")) {
    return res.status(404).json({
      message: "API route not found",
    });
  }

  res.sendFile(path.join(frontendPath, "index.html"));
});

module.exports = app;