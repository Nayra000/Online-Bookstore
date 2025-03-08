const cloudinary = require('cloudinary').v2;
const asyncHandler = require("express-async-handler");

cloudinary.config({
    cloud_name: process.env.cloud_name ,
    api_key: process.env.api_key,
    api_secret: process.env.api_secret
});


exports.uploadImage = asyncHandler(async (imagePath) => {

  const options = {
    use_filename: true,
    unique_filename: false,
    overwrite: true,
  };

    const result = await cloudinary.uploader.upload(imagePath, options);
    return { 
      public_id:result.public_id ,
      url :result.secure_url 
    };

});

exports.deleteImage = asyncHandler(async (image_name) => {
    await cloudinary.api
      .delete_resources([image_name], 
        { type: 'upload', resource_type: 'image' })
      .then(console.log('Image deleted successfully'));

});
