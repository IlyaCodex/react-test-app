const express = require("express");
const path = require("path");
const app = express();
const dotenv = require("dotenv");
const enrichServerWithApiRoutes = require("./api");

dotenv.config();

const port = process.env.PORT || 3000;

const uiDir = path.join(
  path.dirname(require.main?.filename ?? __filename),
  "..",
  "..",
  "ui",
  "build"
);

// Serve static files from the 'build' directory
app.use(express.static(uiDir));
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));
enrichServerWithApiRoutes(app);

app.get("/{*path}", (req, res) => {
  res.sendFile(path.join(uiDir, "index.html"));
});

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
