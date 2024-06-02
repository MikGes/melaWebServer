const express = require("express");
const router = express.Router();
const provider = require("../Schema/Providers");
const bcryptjs = require("bcryptjs");
const nodemailer = require("nodemailer");
const sendVerificationMailToProvider = async(Email,VerificationToken)=>{
  console.log(VerificationToken)
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
            <a href="http://localhost:5000/provider/verifyProviderEmail/${VerificationToken}" style="display: inline-block; background-color: #007bff; color: #ffffff; font-size: 16px; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Verify Email</a>
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
//create a new provider Api
router.post("/create", async (req, res) => {
  const { email, password } = req.body;

  try {
    // Check if a user with the customer email already exists
    const existingUser = await provider.findOne({ email });

    if (existingUser) {
      return res.json({
        success: false,
        message: "Email already exists"
      });
    }

    // Hash the password
    const hashedPassword = await bcryptjs.hash(password, 5);

    const token = Math.floor(1000 + Math.random() * 9000);
    try {
      await sendVerificationMailToProvider(email,token);

    } catch (error) {
      console.error('Error sending email:', error); 
    }
    // Save the user in the database
    await provider.create({
      email,
      password: hashedPassword,
      type_of_user:"provider",
      verificationToken: token,
    });
  
    res.status(200).json({
      success: true
    });
  } catch (error) {
    console.error('Error creating provider:', error);
    res.json({
      success: false,
      message: error.message
    });
  }
});
//route to get all the providers
router.get("/getAllProviders",async(req,res)=>{
    try {
        const providers = await provider.find({})
        res.json({data:providers})
    } catch (error) {
        res.json({erorr:error.message})
    }
})
//route to get all not verified and  profile completed users-> ik the english doesn't make any sense but it works!
router.get("/getAllNotVerified", async (req, res) => {
  try {
    const providers = await provider.find({
      $and: [
        { verified: { $in: ["pending", "declined"] } },
        { completed_profile: true }
      ]
    });
    res.json({ data: providers });
  } catch (error) {
    res.json({ error: error.message });
  }
});

//route to make a specific provider verified
router.put("/verifyProvider/:providerId",async(req,res)=>{
  try {
    const {providerId} = req.params
    const target_provider = await provider.findById(providerId)
    if(target_provider){
      target_provider.verified = "accepted"
      target_provider.save()
      return res.json({success:true})
    }
    res.json({status:false})
  } catch (error) {
    res.json({error:error.message})
  }
})
//route to make a specific provider declined
router.put("/declineProvider/:providerId",async(req,res)=>{
  try {
    const {providerId} = req.params
    const target_provider = await provider.findById(providerId)
    if(target_provider){
      target_provider.verified = "declined"
      target_provider.save()
      return res.json({success:true})
    }
    res.json({status:false})
  } catch (error) {
    res.json({error:error.message})
  }
})
router.put("/rejectProvider/:providerId",async(req,res)=>{
  try {
    const {providerId} = req.params
    const target_provider = await provider.findById(providerId)
    if(target_provider){
      target_provider.verified = "rejected"
      target_provider.save()
      return res.json({success:true})
    }
    res.json({status:false})
  } catch (error) {
    res.json({error:error.message})
  }
})
//route to activate or deActivate provider
router.put('/activateProvider/:id', async (req, res) => {
  const { id } = req.params;
  const { activatedByAdmin } = req.body;

  try {
    const updatedProvider = await provider.findByIdAndUpdate(
      id,
      { activatedByAdmin },
      { new: true }
    );

    if (!updatedProvider) {
      return res.status(404).json({ error: 'Provider not found' });
    }

    res.json({ data: updatedProvider });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

//route to verify email
router.get("/verifyProviderEmail/:VerificationToken", async (req, res) => {
  const VerificationToken = req.params.VerificationToken
  try {
    const user = await provider.findOne({verificationToken:VerificationToken});
    if (user) {
      user.emailVerified = true;
      user.verificationToken = undefined;
      await user.save();
      res.json({message:"email verified successfully"})
    } else {
      res.json({message:"email verification failed"})
      console.log("Erorr")
    }
  } catch (error) {
    console.log(error.message)
    res.json({ message: error.message });
  }
})
//route to disable a provider
router.put('/updateStatus/:id', async (req, res) => {
  try {
    const target_provider = await provider.findById(req.params.id);
    if (!target_provider) {
      return res.send('Provider not found');
    }

    target_provider.activatedByAdmin = req.body.activatedByAdmin;
    await target_provider.save();
    res.send('Provider status updated successfully');
  } catch (error) {
    res.send(error.message);
  }
});

module.exports = router