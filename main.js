const express = require("express");
const os = require("os");
const si = require("systeminformation");
const mongoose = require("mongoose");
require("dotenv").config();
const User = require("./models/Users");
const Stock = require("./models/Stock");
const Orders = require("./models/Orders");
const Menu = require("./models/Menu");
const session = require("express-session");
const bodyParser = require("body-parser");
const ejs = require('ejs')
const path = require('path');
const Users = require("./models/Users");
const port = 80;

const app = express();

app.use(express.static("public"));
mongoose
  .connect(process.env.MONGODB_URI, { dbName: "ordersystem" })
  .then(() => console.log("MongoDB connected..."))
  .catch((err) => console.log(err));

// Middleware
app.use(express.json()); // Ensure this is present and placed before your routes
app.use(express.urlencoded({ extended: false })); // This handles form data
app.set('view engine', 'ejs')
app.set('views', path.join(__dirname, 'views'));

// Session middleware
app.use(
  session({
    secret: "my_secret_key",
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false }, // Set to true in production with HTTPS
  })
);
app.get("/", (req, res) => {
  res.sendFile(__dirname + "/public/userOrder.html");
});
app.post('/api/orders', async (req, res) => {
  if(req.session.user){
    try {
      const { items, note, payment, status } = req.body;
  
      // Create a new order document
      const newOrder = new Orders({
        items,
        note: note,
        payment: payment,
        status: status,
        date: new Date(),
      });
  
      // Save the order to the database
      await newOrder.save();
      res.status(200).json({ message: 'Order placed successfully!' });
    } catch (error) {
      console.error('Error placing order:', error);
      res.status(500).json({ message: 'Error placing order. Please try again.' });
    }
  } else{
    res.send(`<h1>401 Unauthorized</h1>`).status(401);
  }
});

app.get("/api/users", async (req, res) => {
  if (req.session.user && req.session.user.roles === 'administrator' || req.session.user && req.session.user.roles === 'manager') {
    const result = await Users.find({});
    res.json(result).status(200);
  } else {
    res.json(`You don't have permission to access this API`)
  }
})

app.get("/api/show-orders", async (req, res) => {
  if (req.session.user) {
    try {
      const orders = await Orders.find(); // Fetch all orders from the database
      res.status(200).json(orders); // Return the orders in the response
    } catch (err) {
      console.error(err);
      res
        .status(500)
        .json({ message: "An error occurred while retrieving orders" });
    }
  } else {
    res.json("You don't have permission to use this API")
  }
});
app.post('/api/userRolesUpdate', async (req, res) => {
  const { id, role } = req.body;

  if (req.session.user && req.session.user.roles === 'administrator') {
    try {
      const result = await User.findByIdAndUpdate(id, { roles: role }, { new: true });

      if (!result) {
        return res.status(404).send('User not found');
      }

      res.status(200).send('Role updated successfully');
    } catch (error) {
      console.error('Error updating role:', error);
      res.status(500).send('Error updating role');
    }
  } else {
    res.json(`You don't have permission to use this API`).status(403);
  }
});
app.post('/api/deleteMenu', async (req, res) => {
  const { delID } = req.body;

  try {
    const result = await Stock.deleteOne({ id: delID });

    if (result.deletedCount > 0) {
      res.json({ message: "Stock deleted" })
    } else {
      res.json({ message: `${delID} not found on DB` });
    }
  } catch (err) {
    console.error('Error deleting document:', err);
    res.render('index', { alertMessage: 'Error occurred while deleting' });
  }
});
app.post("/api/orders", async (req, res) => {
  try {
    const { items, note, payment, status, date } = req.body;
    
    // Log the received data for debugging
    console.log("Received order data:", req.body);

    // Create a new order instance based on the data sent from the frontend
    const newOrder = new Order({
      items: items,
      note: note,
      payment: payment,
      status: status,
      date: date || new Date(), // Use provided date, or default to current date
    });

    // Save the new order to the database
    await newOrder.save();
    res.status(200).json(newOrder); // Send the created order as response
  } catch (error) {
    console.error("Error creating order:", error);
    res.status(500).json({ error: "Failed to create order" });
  }
});
app.get("/api/getMenu", async (req, res) => {
  const menu = await Stock.find({});
  res.json(menu);
});
app.post("/api/addMenu", async (req, res) => {
  // Check if the user has the right roles
  if (
    req.session.user.roles !== "manager" &&
    req.session.user.roles !== "administrator"
  ) {
    return res
      .status(403)
      .json("You don't have permission to access this page");
  }

  // Extract data from the request body
  const { id, stockname, price, type, img } = req.body;

  // Validate required fields
  if (!id || !stockname || !price || !type) {
    return res.status(400).json("Missing required fields");
  }

  try {
    // Create a new Stock document
    const stock = new Stock({
      id,
      stockname,
      price,
      type, // Ensure 'type' is included
      author: req.session.user.username, // Taken from session
      img,
    });

    // Save the document
    await stock.save();
    res.status(201).json({ message: "Stock added" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error adding stock" });
  }
});

app.post("/api/deleteMenu", async (req, res) => {
  if (
    !req.session.user.roles === "manager" ||
    !req.session.user.roles === "administrator"
  ) {
    res.json(`You don't have permission to access this page`);
  }
});

app.get("/dashboard", (req, res) => {
  if (
    (req.session.user && req.session.user.roles === "administrator") ||
    (req.session.user && req.session.user.roles === "manager")
  ) {
    res.sendFile(__dirname + "/public/serverDashboard.html");
  } else if (req.session.user) {
    res.sendFile(__dirname + "/public/clientDashboard.html");
  } else {
    res
      .status(401)
      .send(`<h1>401 Unauthorized | Maybe login with permission account?</h1>`);
  }
});
app.get("/show-orders", (req, res) => {
  if (req.session.user && req.session.user.roles === 'saler' || req.session.user && req.session.user.roles === 'manager' || req.session.user && req.session.user.roles === 'administrator') {
    res.sendFile(__dirname + "/public/showOrders.html");
  } else {
    res.send(`<h1>401 Unauthorized</h1>`).status(401)
  }
});
app.delete('/api/orders/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const result = await Orders.deleteOne({ _id: id });
    if (result.deletedCount === 0) {
      return res.status(404).send({ message: 'Order not found.' });
    }
    res.status(200).send({ message: 'Order deleted successfully.' });
  } catch (error) {
    console.error('Error deleting order:', error);
    res.status(500).send({ message: 'Failed to delete order.' });
  }
});

app.get("/login", (req, res) => {
  if(req.session.user){
    res.redirect("/dashboard");
  } else{
    res.sendFile(__dirname + "/public/login.html");
  }
});

app.post("/register", async (req, res) => {
  const { username, password, registrationCode } = req.body;

  try {
    if (registrationCode === "applepizza1") {
      const existingUser = await User.findOne({ username });
      if (existingUser) {
        return res.redirect("/login?error=Username already exists");
      }

      const user = new User({
        username,
        password,
        roles: "default", // Explicitly set roles to 'default'
      });

      await user.save();
      req.session.user = user;
    } else {
      return res.redirect(
        "/login?error=Registration Code invalid, ask your admin for new code"
      );
    }

    res.redirect("/dashboard");
  } catch (err) {
    console.error(err);
    res.redirect("/login?error=An error occurred");
  }
});

app.post("/login", async (req, res) => {
  const { username, password } = req.body;

  try {
    const user = await User.findOne({ username });
    if (!user) {
      return res.redirect("/login?error=Invalid username or password");
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.redirect("/login?error=Invalid username or password");
    }

    req.session.user = user;
    res.redirect("/dashboard");
  } catch (err) {
    console.error(err);
    res.redirect("/login?error=An error occurred");
  }
});

app.get("/api/stats", async (req, res) => {
  const cpu = await si.currentLoad();
  const mem = await si.mem();
  const disk = await si.fsSize();
  const net = await si.networkStats();
  if (!req.session.user) {
    res.json(`You don't have permission to view access this API`);
  } else {
    res.json({
      cpu: cpu.currentLoad.toFixed(2),
      ram: ((mem.active / mem.total) * 100).toFixed(2),
      disk: ((disk[0].used / disk[0].size) * 100).toFixed(2),
      bandwidth: net[0].rx_sec / 1024 / 1024,
    });
  }
});
app.post("/api/finishAPI", async (req, res) => {
  if (req.session.user) {
    const { _id } = req.body
    try {
      const result = await Orders.findByIdAndUpdate({ _id: _id }, { status: "done" })
      res.json("OK")
    } catch (err) {
      console.log(err)
      res.json("error")
    }
  }
})
app.get("/api/userAPI", (req, res) => {
  if (!req.session.user) {
    res.json(`Bad request`);
    return;
  } else {
    const username = req.session.user.username;
    const userRole = req.session.user.roles;
    res.json({
      username: username,
      role: userRole,
    });
  }
});
app.get("/logout", (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.redirect("/dashboard");
    }
    res.clearCookie("connect.sid");
    res.redirect("/login");
  });
});
app.get("/client/stock", (req, res) => {
  if (
    (req.session.user && req.session.user.roles === "administrator") ||
    (req.session.user && req.session.user.roles === "manager")
  ) {
    res.sendFile(__dirname + "/public/stockManagement.html");
  } else {
    res
      .status(401)
      .send(`401 Unauthorized | You don't have permission to view this page`);
  }
});
app.get('/order/:id', async (req, res) => {
  try {
    const order = await Orders.findById(req.params.id);

    if (!order) {
      return res.status(404).send({ error: 'Order not found' });
    }

    res.render('order', { order });
  } catch (err) {
    res.status(500).send({ error: 'Failed to retrieve order' });
    console.log(err)
  }
});
app.get("/admin/users", (req, res) => {
  if (req.session.user && req.session.user.roles === 'administrator' || req.session.user && req.session.user.roles === 'manager') {
    res.sendFile(__dirname + '/public/users.html')
  } else {
    res.status(401).send(`<h1>401 Unauthorized</h1>`)
  }
})

app.listen(port, () => {
  console.log("Server is running on http://localhost:80");
});
