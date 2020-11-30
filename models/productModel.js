const {db} = require('../db');

const ObjectId = require('mongodb').ObjectId;

module.exports.list = async () =>  await db().collection('product').find().toArray();

module.exports.delete = async (id) => 
{
    await db().collection('product').deleteOne({ _id: ObjectId(id) });
}

module.exports.add = async (body) => 
{
    
    const brand =  await db().collection('brand').find({name: body.brand}).toArray();
    const idBrand = brand[0]._id;
    const category =  await db().collection('category').find({name: body.category}).toArray();
    const idCategory = category[0]._id;

    await db().collection('product').insertOne({name: body.name, images_sources: [body.image], price: body.price, discount: body.discount, description: body.description, brand: ObjectId(idBrand), category: ObjectId(idCategory)});
}

module.exports.update = async (body, id) => 
{
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

    
    let category;
    let idCategory;
    if(body.category !== "")
    {
        category =  await db().collection('category').find({name: body.category}).toArray();
        idCategory = category[0]._id;
    }
    else
    {
        idCategory = product[0].category;
    }

    let brand;
    let idBrand;
    if(body.brand !== "")
    {
        brand =  await db().collection('brand').find({name: body.brand}).toArray();
        idBrand = brand[0]._id;
    }
    else
    {
        idBrand = product[0].brand;
    }
    await db().collection('product').updateOne( {_id: ObjectId(id)} ,{$set: {name: name, price: price, discount: discount, description: description, brand: ObjectId(idBrand), category: ObjectId(idCategory)}}, null);

}