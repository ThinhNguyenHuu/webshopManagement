const {db} = require('../db');
const ObjectId = require('mongodb').ObjectId;
const Double = require('mongodb').Double;
const cloudinary = require('../cloudinary');
const brandModel = require('./brandModel');
const categoryModel = require('./categoryModel');
const orderModel = require('./orderModel');


module.exports.list = async (pageIndex, itemPerPage, searchText, categoryId, brandId) => {

    const result = await Promise.all([ brandModel.list(), categoryModel.list() ]);
    const listBrand = result[0];
    const listCategory = result[1];

    // get filter
    const filter = getFilter(searchText, categoryId, brandId);
        
    // get count
    const count = await this.count(filter);

    // get last page
    let lastPage = Math.ceil(count / itemPerPage);
    lastPage = lastPage < 1 ? 1 : lastPage;

    // get current page
    let page = parseInt(pageIndex) || 1;
    page = page < 0 ? 1 : page;
    page = page > lastPage ? lastPage : page;

    const listProduct = await db().collection('product').find(filter, {
        skip: itemPerPage * (page - 1),
        limit: itemPerPage
    }).sort({_id: -1}).toArray();

    listProduct.map(product => {
        product.brand = listBrand.find(brand => brand._id.equals(product.brand)).name;
        product.category = listCategory.find(category => category._id.equals(product.category)).name;
        return product; 
    });

    return {
        listBrand,
        listCategory,
        listProduct,
        page,
        lastPage
    };
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
        price: Double(body.price), 
        discount: Double(body.discount), 
        description: body.description, 
        brand: ObjectId(body.brand), 
        category: ObjectId(body.category),
        reviews: [],
        view_count: 0,
        sell_count: 0
    });
}

module.exports.update = async (data, files, id) => {

    const product = await this.findOne(id);

    let sources = null;
    if (files) {
        const destroyPromise = cloudinary.destroyFiles(product.images_sources);
        const new_sources = await cloudinary.uploadFiles(files);
        await destroyPromise;
        sources = [...new_sources];
    }

    await db().collection('product').updateOne( {_id: ObjectId(id)} ,{$set: {
        name: data.name, 
        price: Double(data.price),
        images_sources: sources ? sources : product.images_sources, 
        discount: Double(data.discount), 
        description: data.description, 
        brand: ObjectId(data.brand), 
        category: ObjectId(data.category)
    }});
}

module.exports.listTopTenSeller = async (categoryId, brandId) => {
    const filter = getFilter(null, categoryId, brandId);
    return await db().collection('product').find(filter).sort({sell_count: -1}).limit(10).toArray();
}

module.exports.findOne = async (id) => await db().collection('product').findOne({_id: ObjectId(id)});

module.exports.count = async (filter) => await db().collection('product').countDocuments(filter);

module.exports.checkDuplicated = async (id, newName) => {
    
    const filter = { $and: [ { name: newName } ]};
    if (id) filter.$and.push({ _id: { $ne: ObjectId(id) } });
    return await db().collection('product').findOne(filter);
}

const getFilter = (searchText, categoryId, brandId) => {

    let filter = { $and: [] };

    // if searchText != null
    if(searchText != null) {
        filter.$and.push({
          $or: [
            { $text: { $search: searchText } },
            { name: { $regex: searchText, $options: 'i' } }
          ]
        })
      };

    // if id != 'All'
    if (ObjectId.isValid(categoryId)) {
        filter.$and.push({ category: ObjectId(categoryId) });
    }
  
    // if id != 'All'
    if (ObjectId.isValid(brandId)) {
        filter.$and.push({ brand: ObjectId(brandId) });
    }

    if (filter.$and.length == 0)
        filter = {};
  
    return filter;
}
