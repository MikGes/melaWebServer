const express = require("express")
const router = express.Router()
const Services = require('../Schema/Services')

//creating a service
router.post("/",async(req,res)=>{
    try {
        const {name,serviceImage} = req.body;
        await Services.create({
            name,
            serviceImage,
        })
        res.json({success:"Service Created Succesfully"})
    } catch (error) {
        res.json({error:"Can't create service"})
        console.log(error)
    }
})

//returning all the services
router.get("/",async(req,res)=>{
        try {
            const services = await Services.find({})
            res.json({data:services})
        } catch (error) {
            res.json({error:"Can't fetch services"})
        }
})

//returning a single services
router.get("/:id", async(request, response)=>{
    try{
        const { id } = request.params;
        const service = await Services.findOne({_id:id})
        if(!service){
            return response.status(404).json({message: "Service is not found"})
        }
        response.status(200).json(service)


    } catch(error){
        console.log(error.message)
        response.send({message: error.message})
    }
})

//updating a service
router.put("/:id", async(request, response)=>{
    try{
        const { id } = request.params;
        const result = await Services.findByIdAndUpdate(id, request.body);
        if(!result){
            return response.status(404).json({message: "Service is not found"})
        }
        return response.status(200).send({message:"Service updated succesfully"})
    }catch(error){
        console.log(error.message)
        response.status(500).send({message: error.message})
    }
})

//deleting a service

router.delete("/:id", async(request, response)=>{
    try{
        const { id } = request.params;
        const serviceAvailable = await Services.find({_id:id})
        if(!serviceAvailable){
            return response.json({error: "Service is not found"})
        }
       else{
        const result = await Services.findByIdAndDelete(id)
        if(!result){
            return response.json({error: "Service is not found"})
        }
       }
        return response.send({message: "Service is deleted succesfully"})

    }catch(error){
        console.log(error.message)
        response.status(500).send({error:error.message})
    }
})
module.exports = router