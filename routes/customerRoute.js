const express = require("express")
const route = express.Router()
const customer = require("../Schema/Customers")
const bcryptjs = require("bcryptjs")
const nodemailer = require("nodemailer");

const sendVerificationMailToCustomer = async(Email,VerificationToken)=>{
  const transponder = nodemailer.createTransport({
     service:"gmail",
      auth: {
          user: "melahomeservicefinder@gmail.com",
          pass: "dkoz rtzz oicv bwor",
      },
    });
  
    const mailOptions = {
      from: "Mela Services",
      to: Email,
      subject: "Email Verification!",
      html: `
        <div style="background-color: #4e8cff; padding: 20px;">
          <h1 style="color: white; font-size: 28px; text-align: center;">Mela Services</h1>
        </div>
        <div style="padding: 20px;">
          <p style="font-size: 16px; color: #333333; text-align: center;">Welcome to Mela Services.</p>
          <p style="font-size: 16px; color: #333333; text-align: center;">Click the button below to verify your email address.</p>
          <div style="text-align: center; margin-top: 20px;">
            <a href="http://localhost:5000/customer/verifyCustomerEmail/${VerificationToken}" style="display: inline-block; background-color: #007bff; color: #ffffff; font-size: 16px; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Verify Email</a>
          </div>
        </div>
      `,
    };
    
  try {
      await transponder.sendMail(mailOptions);
  } catch (error) {
      console.log(error.message);
  }
    
}
//create customer account Api
route.post("/create", async (req, res) => {
  const { email, password } = req.body;

  try {
    // Check if a user with the customer email already exists
    const existingUser = await customer.findOne({ email });

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
    try {
      await sendVerificationMailToCustomer(email,token);

    } catch (error) {
      console.error('Error sending email:', error); 
    }
    await customer.create({
      email,
      password: hashedPassword,
      type_of_user:"customer",
      verificationToken: token
    });
    res.status(200).json({
      success: true
    });
  } catch (error) {
    console.error('Error creating customer:', error);
    res.json({
      success: false,
      message: error.message
    });
  }
});
route.get("/getAllCustomers",async(req,res)=>{
    try {
        const customers = await customer.find({})
        res.json({data:customers})
    } catch (error) {
        res.json({erorr:error.message})
    }
})
//route to make customer active or deactive
route.put('/updateStatus/:id', async (req, res) => {
  try {
    const target_customer = await customer.findById(req.params.id);
    console.log(target_customer)
    if (!target_customer) {
      return res.send('Customer not found');
    }

    target_customer.activatedByAdmin = req.body.activatedByAdmin;
    console.log(req.body.activatedByAdmin)
    await target_customer.save();
    res.send('Customer status updated successfully');
  } catch (error) {
    res.send(error.message);
  }
});

module.exports  = route