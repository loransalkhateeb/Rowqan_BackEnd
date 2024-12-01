const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');
const cloudinary = require('../Config/cloudinaryConfig');

const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'uploads/chalets_images', 
        allowed_formats: ['jpg', 'png', 'mp4'], 
    },
});

const upload = multer({ storage });

module.exports = upload;
