const cloudinary = require('cloudinary').v2;

cloudinary.config({
  cloud_name: 'webshopimages',
  api_key: '657162753779718',
  api_secret: 'E0cGXsMiMZ3_sJqM_yowGVr6gww'
})

module.exports.upload = (file) => {
  return new Promise(resolve => {
    cloudinary.uploader.upload(file, (error, result) => {
      resolve({
        url: result.url,
        id: result.public_id  
      });
    });
  });
}

module.exports.destroy = (id) => {
  return new Promise(resolve => {
    cloudinary.uploader.destroy(id, (error, result) => {
      resolve({});
    });
  });
}