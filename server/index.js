const express = require("express");
const app = express();
const mongoose = require('mongoose');
const Product = require("./model/product");
const Payment = require("./model/payment");
const Order = require("./model/order");
const cors = require('cors'); // Import the cors middleware
require('dotenv').config()
async function main(){
 await  mongoose.connect(process.env.DB_URL,
    { useNewUrlParser: true, useUnifiedTopology: true })
}
main().then(()=>console.log("connected")).catch((err)=>console.log(err))

app.use(cors({
    origin: 'http://localhost:5173' // Allow requests from this origin
}));
app.use(express.json());

app.listen(8080,(req,res)=>{
    console.log("server started");
})


app.get("/",async (req,res)=>{
    try{
    const data = await Product.find();

    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/payment", async (req, res) => {
  try {

    // Create and save the payment document
    const payment = await Payment.create(req.body);

    // Return a success response
    res.status(201).json({ success: true, payment });
  } catch (err) {
    console.error(err); // Log the error for debugging
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post("/orders", async (req, res) => {
  try {
    // Create and save the payment document
    const products = [];

    for (let i = 0; i < req.body.cart.length; i++) {

      const product = await Product.find({ title: req.body.cart[i].title });
      products.push({ product: product[0]._id, quantity: req.body.cart[i].quantity });
    }
    
    const orders = await Order.create({ products, user: req.body.sender });
    // Return a success response
    res.status(201).json({ success: true, orders });
  } catch (err) {
    console.error(err); // Log the error for debugging
    res.status(500).json({ success: false, error: err.message });
  }
});

app.get("/cart",(req,res)=>{

})

