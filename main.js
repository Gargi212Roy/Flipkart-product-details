const express = require("express");
const mongoose = require("mongoose");
require("dotenv").config();

const authRoutes = require("./routes/api/authRoutes");
const productRoutes = require("./routes/api/productRoutes");

mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("Connected MongoDb"))
  .catch((err) => console.log(err));

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/product", productRoutes);

const PORT = 8080;
app.listen(PORT, () => console.log(`server started on port ${PORT} `));
