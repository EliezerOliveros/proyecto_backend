import mongoose from "mongoose";

const cartSchema = new mongoose.Schema({
  products: [
    {
      product: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: "Product", 
        required: true, 
        validate: {
          validator: function(v) {
            return mongoose.Types.ObjectId.isValid(v);
          },
          message: props => `${props.value} is not a valid Product ID!`
        }
      },
      quantity: { 
        type: Number, 
        required: true, 
        min: [1, "Quantity must be at least 1"], 
        default: 1 
      }
    }
  ]
}, { timestamps: true });

// 📌 Agregar índice para mejorar las consultas por productos en el carrito
cartSchema.index({ "products.product": 1 });

// 📌 Prevenir productos duplicados en el carrito (merge en vez de duplicar)
cartSchema.pre("save", function(next) {
  this.products = this.products.reduce((acc, item) => {
    const existing = acc.find(p => p.product.equals(item.product));
    if (existing) {
      existing.quantity += item.quantity;
    } else {
      acc.push(item);
    }
    return acc;
  }, []);
  
  next();
});

const Cart = mongoose.model("Cart", cartSchema);
export default Cart;
