const cloudinary = require('cloudinary').v2;

cloudinary.config({
    cloud_name: 'durjqlivi', 
    api_key: '566485144228784',       
    api_secret: 'iiOFtwNBlnQl08CZWUft076mMtE', 
});

module.exports = cloudinary;
