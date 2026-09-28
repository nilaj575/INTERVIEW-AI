const express = require("express");
const path = require("path");
const cookieParser = require("cookie-parser");
const cors = require("cors");

const app = express();

// Allowed origins
const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:3000",
];

app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (Postman, server-side requests, etc.)
      if (!origin) {
        return callback(null, true);
      }

      if (allowedOrigins.includes(origin)) {
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

// Backend API routes
const authrouter = require("./routes/auth.routes");
const interViewRouter = require("./routes/interview.routes");

app.use("/api/auth", authrouter);
app.use("/api/interview", interViewRouter);

// React/Vite frontend fallback
app.get("*", (req, res) => {
  if (req.path.startsWith("/api/")) {
    return res.status(404).json({
      message: "API route not found",
    });
  }

  res.sendFile(path.join(frontendPath, "index.html"));
});

module.exports = app;