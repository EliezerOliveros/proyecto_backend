import express from "express";
import mongoose from "mongoose";
import Cart from "../module/cart.models.js";
import Product from "../module/product.models.js";

const router = express.Router();

// ✅ Middleware para validar ObjectId antes de buscar en MongoDB
const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

// 🛒 Crear un nuevo carrito
router.post("/", async (req, res) => {
  try {
    const newCart = new Cart({ products: [] });
    await newCart.save();
    res.status(201).json({ message: "Cart created successfully", cart: newCart });
  } catch (error) {
    res.status(500).json({ message: "Error creating cart", error });
  }
});

// 🛒 Obtener un carrito por ID
router.get("/:cid", async (req, res) => {
  try {
    if (!isValidObjectId(req.params.cid)) return res.status(400).json({ message: "Invalid Cart ID" });

    const cart = await Cart.findById(req.params.cid).populate("products.product");
    if (!cart) return res.status(404).json({ message: "Cart not found" });

    res.json(cart);
  } catch (error) {
    res.status(500).json({ message: "Error fetching cart", error });
  }
});

// ➕ Agregar un producto al carrito
router.post("/:cid/product/:pid", async (req, res) => {
  try {
    if (!isValidObjectId(req.params.cid) || !isValidObjectId(req.params.pid)) 
      return res.status(400).json({ message: "Invalid Cart or Product ID" });

    const cart = await Cart.findById(req.params.cid);
    const product = await Product.findById(req.params.pid);
    if (!cart || !product) return res.status(404).json({ message: "Cart or Product not found" });

    const existingProduct = cart.products.find(p => p.product.equals(req.params.pid));
    if (existingProduct) {
      existingProduct.quantity += 1;
    } else {
      cart.products.push({ product: req.params.pid, quantity: 1 });
    }

    await cart.save();
    res.json({ message: "Product added to cart", cart });
  } catch (error) {
    res.status(500).json({ message: "Error adding product to cart", error });
  }
});

// ❌ Eliminar un producto del carrito
router.delete("/:cid/product/:pid", async (req, res) => {
  try {
    if (!isValidObjectId(req.params.cid) || !isValidObjectId(req.params.pid)) 
      return res.status(400).json({ message: "Invalid Cart or Product ID" });

    const cart = await Cart.findById(req.params.cid);
    if (!cart) return res.status(404).json({ message: "Cart not found" });

    cart.products = cart.products.filter(p => !p.product.equals(req.params.pid));

    if (cart.products.length === 0) {
      await Cart.findByIdAndDelete(req.params.cid);
      return res.json({ message: "Cart is now empty and has been deleted." });
    }

    await cart.save();
    res.json({ message: "Product removed from cart", cart });
  } catch (error) {
    res.status(500).json({ message: "Error removing product from cart", error });
  }
});

export default router;
