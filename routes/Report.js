const express = require("express")
const router = express.Router()
const Report = require('../Schema/report');

//returning all the reports
router.get("/getAllReports", async (req, res) => {
    try {
        const reports = await Report.find()
            .populate({
                path: 'reporter_id',
                model: 'customer',  // Specify the model to use for population
                select: 'name',  // Select only the name field
            })
            .populate({
                path: 'reported_provider_id',
                model: 'provider',  // Specify the model to use for population
                select: 'name',  // Select only the name field
            });

        res.status(200).json(reports);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "An error occurred while fetching reports" });
    }
});


module.exports = router