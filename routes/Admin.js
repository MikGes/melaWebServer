const express = require("express")
const route = express.Router()
const Admins = require("../Schema/Admins")
const bcryptjs = require("bcryptjs");
const jwt = require('jsonwebtoken');
//create Admins account Api
route.post("/create", async (req, res) => {
  const { name, email, password } = req.body;

  try {
    // Check if a user with the Admins email already exists
    const existingUser = await Admins.findOne({ email });

    if (existingUser) {
      return res.json({
        success: false,
        message: "Email already exists"
      });
    }

    // Hash the password
    const hashedPassword = await bcryptjs.hash(password, 5);

    // Save the user in the database
    const token = Math.floor(1000 + Math.random() * 9000);
    await Admins.create({
      name,
      email,
      password: hashedPassword,
      type_of_user:"admin",
      activatedByAdmin: true,
    });
    res.status(200).json({
      success: true
    });
  } catch (error) {
    console.error('Error creating Admins:', error);
    res.json({
      success: false,
      message: error.message
    });
  }
});
route.get("/getAllAdmins",async(req,res)=>{
    try {
        const admins = await Admins.find({})
        res.json({data:admins})
    } catch (error) {
        res.json({erorr:error.message})
    }
})
route.put('/updateStatus/:id', async (req, res) => {
  try {
    const admin = await Admins.findById(req.params.id);
    if (!admin) {
      return res.send('Admin not found');
    }

    admin.activatedByAdmin = req.body.activatedByAdmin;
    await admin.save();
    res.status(200).send('Admin status updated successfully');
  } catch (error) {
    res.send(error.message);
  }
});
//route to login
route.get('/login/:email/:password', async (req, res) => {
  const { email, password } = req.params;

  if (!email || !password) {
    return res.json({ msg: 'Please provide email and password', success: false });
  }

  try {
    const admin = await Admins.findOne({ email, activatedByAdmin: true });
    if (!admin) {
      return res.json({ msg: 'Invalid credentials', success: false });
    }

    const isMatch = await bcryptjs.compare(password, admin.password);
    if (!isMatch) {
      return res.json({ msg: 'Invalid credentials', success: false });
    }

    const token = jwt.sign({ id: admin._id, name: admin.name, email: admin.email }, "melaHomeServiceFinder", { expiresIn: '1h' });

    res.json({ msg: 'Login successful', success: true,token });
  } catch (error) {
    console.error("Error during login:", error);
    res.json({ msg: 'Server error', success: false });
  }
});
//route to get one admin
route.get('/getAdmin/:id', async (req, res) => {
 try {
  
  const admin = await Admins.findById(req.params.id);
  if (!admin) {
    return res.send('Admin not found');
  }
  res.json({name:admin.name,email:admin.email});
 } catch (error) {
  res.send(error.message)
 }
});
//route to update admin
route.put('/update/:id', async (req, res) => {
  try {
    console.log(req.params.id)
    const admin = await Admins.findById(req.params.id);
  if (!admin) {
    return res.send('Admin not found');
  }
  admin.name = req.body.name;
  admin.email = req.body.email;
  await admin.save();
  res.send('Admin updated successfully');
  } catch (error) {
    console.log(error.message)
    res.send(error.message)
  }
});
module.exports  = route