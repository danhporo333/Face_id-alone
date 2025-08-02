import express from "express";
import "dotenv/config";
import path from "path";
import cors from "cors";
import passport from "./config/passport";
import apiRoutes from "./routes/api";
import testRoutes from "./routes/testRoutes";
// import fileUpload from "express-fileupload";
const app = express();
const port = process.env.PORT || 8080;

//config file upload
// app.use(fileUpload());
app.use("/image", express.static(path.join(__dirname, "Public/image")));
app.use("/excel", express.static(path.join(__dirname, "Public/excel/imports")));
app.use(
  "/model",
  express.static(
    path.join(__dirname, "../../../face_id/frontend/src/Public/model")
  )
);
app.use(express.static(path.join(__dirname, "../../../face_id/frontend/src")));
//config req.body
app.use(
  cors({
    origin: [
      "http://localhost:3000", // React dev server
      "http://localhost:5173", // Vite dev server
      "https://faceid.io.vn", // Production domain
    ],
    credentials: true,
  })
);
app.use(express.json()); // for json
app.use(express.urlencoded({ extended: true })); // for form data

// Passport middleware
app.use(passport.initialize());
//khai báo routes
app.use("/v1/api/", apiRoutes);

// Test routes (chỉ dùng khi development)
if (process.env.NODE_ENV !== "production") {
  app.use("/api/test", testRoutes);
}

app.listen(port, () => {
  console.log(`Server started on port: ${port}`);
});
