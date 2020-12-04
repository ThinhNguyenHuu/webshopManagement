const {db} = require('../db');
const ObjectId = require('mongodb').ObjectId;
const cloudinary = require('../cloudinary');
const fs = require('fs');

module.exports.list = async () => await db().collection('product').find().toArray();

module.exports.delete = async (id) => {
    const collection = db().collection('product');
    const product = await collection.findOne({ _id: ObjectId(id) });
    const deletePromise = collection.deleteOne({ _id: ObjectId(id) });
    
    await destroyFiles(product.images_sources);
    await deletePromise;
}

module.exports.add = async (body, files) => {   
    const sources = await uploadFiles(files);

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

module.exports.update = async (body, files, id) => {
    const product = await db().collection('product').find({_id: ObjectId(id)}).toArray();

    let name;
    let images_sources;
    let price;
    let discount;
    let description;

    if(body.name !== "")
        name = body.name;
    else
        name = product[0].name;

    /*
    if(body.image !== "")
        images_sources = body.images;
    else
        images_sources = product[0].images_sources[0];
    */

    if(body.price !== "")
        price = body.price;
    else
        price = product[0].price;

    if(body.discount !== "")
        discount = body.discount;
    else
        discount = product[0].discount;

    if(body.description !== "")
        description = body.description;
    else
        description = product[0].description;

    
    //let category
    // let idCategory;
    // if(body.category !== "")
    // {
    //     category =  await db().collection('category').find({name: body.category}).toArray();
    //     idCategory = category[0]._id;
    // }
    // else
    // {
    //     idCategory = product[0].category;
    // }

    //let brand
    // let idBrand;
    // if(body.brand !== "")
    // {
    //     brand =  await db().collection('brand').find({name: body.brand}).toArray();
    //     idBrand = brand[0]._id;
    // }
    // else
    // {
    //     idBrand = product[0].brand;
    // }

    const brand = body.brand;
    const category = body.category;

    let sources = null;
    if (files) {
        const destroyPromise = destroyFiles(product[0].images_sources);
        const new_sources = await uploadFiles(files);
        await destroyPromise;
        sources = [...new_sources];
    }

    await db().collection('product').updateOne( {_id: ObjectId(id)} ,{$set: {
        name: name, 
        price: price,
        images_sources: sources ? sources : product[0].images_sources, 
        discount: discount, 
        description: description, 
        brand: ObjectId(brand), 
        category: ObjectId(category)
    }}, null);
}

module.exports.findOne = async (options) => await db().collection('product').findOne(options);


const uploadFiles = async (files) => {
    const sources = [];
    if (Array.isArray(files)) {
        for (const file of files) {
            const uploaded = await cloudinary.upload(file.tempFilePath);
            sources.push(uploaded);
            fs.unlinkSync(file.tempFilePath);
        }
    } else {
        const uploaded = await cloudinary.upload(files.tempFilePath);
        sources.push(uploaded);
        fs.unlinkSync(files.tempFilePath);
    }

    return sources;
}

const destroyFiles = async (sources) => {
    for (source of sources) {
        cloudinary.destroy(source.id);
    }
}