const express = require("express");
const router = express.Router();
const multer = require("../Config/Multer");
const path = require("path");
const PropertiesLandsController = require('../Controllers/PropertiesLandsController');
const authMiddleware = require('../MiddleWares/authMiddleware');
const rateLimiter = require('../MiddleWares/rateLimiter');


router.post("/createPropertyLand", authMiddleware, rateLimiter, multer.single("image"), PropertiesLandsController.createPropertyLand);


router.get("/getAllPrpertiesLands/:lang", PropertiesLandsController.getAllPropertyLands);


router.get("/getAllPropertyLandsByLandId/:category_land_id/:lang", PropertiesLandsController.getPropertyLandByland_id);


router.get("/getPropertyLandById/:id/:lang", PropertiesLandsController.getPropertyLandById);


router.put("/UpdatePropertiesLand/:id", authMiddleware, rateLimiter, multer.single("image"), PropertiesLandsController.updatePropertyLand);


router.delete("/deletePropertyLand/:id/:lang", authMiddleware, PropertiesLandsController.deletePropertyLand);

module.exports = router;
