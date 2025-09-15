const express = require('express');// As in the server.js
const route = express.Router(); //Allows us use express router in this file
const services = require('../services/render');//uses the render.js file from services here

const validateDrug = require('../middleware/validateDrug');//uses the validateDrug.js file from middleware here

const controller = require('../controller/controller');//uses the render.js file from services here


// views
route.get('/', services.home);


route.get('/manage', services.manage);
route.get('/dosage', services.dosage);
route.get('/purchase', services.purchase);
route.get('/add-drug', services.addDrug);
route.get('/update-drug', services.updateDrug);

// Create drug with validation
route.post('/api/drugs', validateDrug, controller.create);

// Get drugs
route.get('/api/drugs', controller.find);

// Update drug with validation
route.put('/api/drugs/:id', validateDrug, controller.update);

// Delete drug
route.delete('/api/drugs/:id', controller.delete);

// route POST để tính toán số ngày (form trên purchase.ejs gửi về)
route.post('/purchase', controller.calculatePurchase);

module.exports = route;//exports this so it can always be used elsewhere
