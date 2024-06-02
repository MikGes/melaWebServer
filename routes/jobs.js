const express = require("express");
const router = express.Router();
const Provider = require("../Schema/Providers");
const Services = require("../Schema/Services");
const Customers = require("../Schema/Customers");
const Admins = require("../Schema/Admins");
router.get('/status-count', async (req, res) => {
    try {
      const providers = await Provider.aggregate([
        { $unwind: '$serviceRequest' },
        {
          $group: {
            _id: '$serviceRequest.status',
            count: { $sum: 1 },
          },
        },
      ]);
  
      // Format the results into a more readable object
      const result = {
        pending: 0,
        completed: 0,
        accepted: 0,
      };
      var totRequests = 0;
      providers.forEach((provider) => {
        totRequests += provider.count;
        if (provider._id === 'pending') {
          result.pending = provider.count;
        } else if (provider._id === 'completed') {
          result.completed = provider.count;
        } else if (provider._id === 'accepted') {
          result.accepted = provider.count;
        }
      });
  
      res.status(200).json({...result, total: totRequests});
    } catch (error) {
      res.status(500).json({ message: 'An error occurred', error });
    }
  });
  router.get('/usercounts', async (req, res) => {
    try {
      // Count the number of documents in each collection
      const customerCount = await Customers.countDocuments();
      const providerCount = await Provider.countDocuments();
      const serviceCount = await Services.countDocuments();
      const adminCount = await Admins.countDocuments();

      const totalCount = customerCount + providerCount;
  
      // Prepare the response object
      const result = {
        customers: customerCount,
        providers: providerCount,
        services: serviceCount,
        admin:adminCount,
        total: totalCount,
      };
  
      res.status(200).json(result);
    } catch (error) {
      res.status(500).json({ message: 'An error occurred', error });
    }
  });
  module.exports = router