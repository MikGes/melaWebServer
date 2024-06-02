const express = require("express")
const route = express.Router()
const nodemailer = require("nodemailer")
const customer = require("../Schema/Customers")
const sendVerifyEmail = async(ProviderEmail,ProviderName)=>{
    const transponder = nodemailer.createTransport({
       service:"gmail",
        auth: {
            user: "melahomeservicefinder@gmail.com",
            pass: "dkoz rtzz oicv bwor",
        },
      });
    
      const mailOptions = {
        from: "Mela Services",
        to: ProviderEmail,
        subject: "Profile Verified!",
        html: `
          <div style="background-color: #4e8cff; padding: 20px;">
            <h1 style="color: white; font-size: 28px; text-align: center;">Mela Services</h1>
          </div>
          <div style="padding: 20px;">
            <p style="font-weight: bold; color: lightgreen; font-size: 16px;">Hello ${ProviderName}!</p>
            <p color: #4e8cff; font-size: 18px;">Mela Services has verified your account. You may now accept job requests from our customers.</p>
          </div>
        `,
      };
      
    try {
        await transponder.sendMail(mailOptions);
    } catch (error) {
        console.log(error.message);
    }
    
    }
    const sendDeclineAccount = async(ProviderEmail,ProviderName)=>{
        const transponder = nodemailer.createTransport({
           service:"gmail",
            auth: {
                user: "melahomeservicefinder@gmail.com",
                pass: "dkoz rtzz oicv bwor",
            },
          });
        
          const mailOptions = {
            from: "Mela Services",
            to: ProviderEmail,
            subject: "Profile Rejected!",
            html: `
              <div style="background-color: #4e8cff; padding: 20px;">
                <h1 style="color: white; font-size: 28px; text-align: center;">Mela Services</h1>
              </div>
              <div style="padding: 20px;">
                <p style="font-weight: bold; color: lightgreen; font-size: 16px;">Hello ${ProviderName}!</p>
                <p color: #4e8cff; font-size: 18px;">We are sorry to inform you that your profile has been rejected. Please contact us for more information.</p>
              </div>
            `,
          };
          
        try {
            await transponder.sendMail(mailOptions);
        } catch (error) {
            console.log(error.message);
        }
        
        }
route.post("/sendVerifyAccount", async (req, res) => {
    try {
    await sendVerifyEmail(req.body.email,req.body.name)
    res.json({success:true})    
    } catch (error) {
        res.json({error:error.message})
    }
})
route.post("/sendDeclineAccount", async (req, res) => {
    try {
    await sendDeclineAccount(req.body.email,req.body.name)
    res.json({success:true})    
    } catch (error) {
        res.json({error:error.message})
    }
})

   //route for the cusomter to verify his or her email
   route.get("/verifyCustomerEmail/:VerificationToken", async (req, res) => {
    const VerificationToken = req.params.VerificationToken
    try {
      const user = await customer.findOne({verificationToken:VerificationToken});
      if (user) {
        user.emailVerified = true;
        user.verificationToken = undefined;
        await user.save();
        res.json({message:"email verified successfully"})
      } else {
        res.json({message:"email verification failed"})
      }
    } catch (error) {
      res.json({ message: error.message });
    }
  })
module.exports = route