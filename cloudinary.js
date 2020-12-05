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

module.exports.uploadFiles = async (files) => {
  const sources = [];
  if (Array.isArray(files)) {
      for (const file of files) {
          const uploaded = await upload(file.tempFilePath);
          sources.push(uploaded);
          fs.unlinkSync(file.tempFilePath);
      }
  } else {
      const uploaded = await upload(files.tempFilePath);
      sources.push(uploaded);
      fs.unlinkSync(files.tempFilePath);
  }

  return sources;
}

module.exports.destroyFiles = async (sources) => {
  for (source of sources) {
      cloudinary.destroy(source.id);
  }
}