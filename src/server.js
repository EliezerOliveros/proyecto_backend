import express from "express";
import mongoose from "mongoose";
import { engine } from "express-handlebars";
import path from "path";
import { fileURLToPath } from "url";
import productRoutes from "./routes/products.js";
import cartRoutes from "./routes/cart.js";
import Product from "./module/product.models.js";  

const app = express();
const PORT = 5000;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));

// Handlebars
app.engine("hbs", engine({ extname: ".hbs" }));
app.set("view engine", "hbs");
app.set("views", path.join(__dirname, "views"));


// Routes
app.use("/api/products", productRoutes);
app.use("/api/cart", cartRoutes);

// View Routes
app.get("/products", async (req, res) => {
  try {
      const products = await Product.find();
      res.render("products", { products });
  } catch (error) {
      res.status(500).render("error", { error: "Failed to load products" });
  }
});

app.get("/cart", async (req, res) => {
  try {
      res.render("cart");
  } catch (error) {
      res.status(500).render("error", { error: "Failed to load cart" });
  }
});

// Connect to MongoDB
mongoose.connect("mongodb://localhost:27017/fruitstore", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(async () => {
  console.log("Connected to MongoDB");

  // Insert sample products if collection is empty
  const count = await Product.countDocuments();
  if (count === 0) {
    await Product.insertMany([
      { title: "Apple", description: "Fresh red apples", code: "APL01", price: 2.5, status: true, stock: 50, category: "fruits" },
      { title: "Banana", description: "Sweet yellow bananas", code: "BAN02", price: 1.2, status: true, stock: 100, category: "fruits" },
      { title: "Orange", description: "Juicy oranges", code: "ORG03", price: 3.0, status: true, stock: 80, category: "fruits" },
      { title: "Strawberry", description: "Fresh strawberries", code: "STB04", price: 5.0, status: true, stock: 30, category: "fruits" },
      { title: "Grapes", description: "Sweet grapes", code: "GRP05", price: 4.0, status: true, stock: 60, category: "fruits" },
      { title: "Pineapple", description: "Tropical pineapple", code: "PNP06", price: 6.0, status: true, stock: 20, category: "fruits" },
      { title: "Watermelon", description: "Large juicy watermelon", code: "WTM07", price: 7.0, status: true, stock: 15, category: "fruits" },
      { title: "Mango", description: "Sweet mangoes", code: "MNG08", price: 3.5, status: true, stock: 40, category: "fruits" },
      { title: "Peach", description: "Delicious peaches", code: "PCH09", price: 4.5, status: true, stock: 25, category: "fruits" },
      { title: "Pear", description: "Juicy pears", code: "PER10", price: 2.8, status: true, stock: 35, category: "fruits" }
    ]);
    console.log("Sample products added to the database");
  }

  app.get("/", (req, res) => {
    res.render("index"); // Asegúrate de tener el archivo views/index.handlebars
  });

  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
}).catch(err => console.log(err));
