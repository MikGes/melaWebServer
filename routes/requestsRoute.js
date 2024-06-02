const express = require("express")
const route = express.Router()
const customer = require("../Schema/Customers")// Route to get all requests from customers
route.get('/getAllRequests', async (req, res) => {
    try {
        // Fetch customers and populate the requested_Providers field
        const target_customers = await customer.find().populate('requested_Providers.requested_provider_id');

        // Extract all requests with the required information
        const allRequests = target_customers.reduce((requests, customer) => {
            const customerRequests = customer.requested_Providers.map(request => ({
                customerName: customer.name,
                customerImage: customer.customer_image,
                customerPhone: customer.customer_phone,
                customerEmail: customer.email,
                serviceStatus: request.status,
                serviceDescription: request.service_description,
                providerName: request.requested_provider_id ? request.requested_provider_id.name : null,
                providerImage: request.requested_provider_id ? request.requested_provider_id.provider_image : null,
                providerPhone: request.requested_provider_id ? request.requested_provider_id.provider_phone : null,
                providerEmail: request.requested_provider_id ? request.requested_provider_id.email : null,
                providerRating: request.requested_provider_id ? request.requested_provider_id.rating : null,
            }));
            return requests.concat(customerRequests);
        }, []);

        res.json({ data: allRequests });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});
module.exports = route