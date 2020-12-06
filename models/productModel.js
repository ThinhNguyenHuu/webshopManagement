const {db} = require('../db');
const ObjectId = require('mongodb').ObjectId;
const cloudinary = require('../cloudinary');
const fs = require('fs');

module.exports.list = async (filter, pageIndex, itemPerPage) => {
    return await db().collection('product').find(filter, {
        skip: itemPerPage * pageIndex,
        limit: itemPerPage
    }).toArray();
}

module.exports.delete = async (id) => {
    const collection = db().collection('product');
    const product = await collection.findOne({ _id: ObjectId(id) });
    const deletePromise = collection.deleteOne({ _id: ObjectId(id) });
    
    await cloudinary.destroyFiles(product.images_sources);
    await deletePromise;
}

module.exports.add = async (body, files) => {   
    const sources = await cloudinary.uploadFiles(files);

    await db().collection('product').insertOne({
        name: body.name, 
        images_sources: sources, 
        price: body.price, 
        discount: body.discount, 
        description: body.description, 
        brand: ObjectId(body.brand), 
        category: ObjectId(body.category),
        reviews: []
    });
}

module.exports.update = async (data, files, id) => {
    const product = await db().collection('product').findOne({_id: id});

    let sources = null;
    if (files) {
        const destroyPromise = cloudinary.destroyFiles(product[0].images_sources);
        const new_sources = await cloudinary.uploadFiles(files);
        await destroyPromise;
        sources = [...new_sources];
    }

    await db().collection('product').updateOne( {_id: ObjectId(id)} ,{$set: {
        name: data.name || product.name, 
        price: data.price || product.price,
        images_sources: sources || product.images_sources, 
        discount: data.discount || product.discount, 
        description: data.description || product.description, 
        brand: ObjectId(data.brand), 
        category: ObjectId(data.category)
    }}, null);
}

module.exports.findOne = async (options) => await db().collection('product').findOne(options);

module.exports.count = async (filter) => await db().collection('product').countDocuments(filter);
