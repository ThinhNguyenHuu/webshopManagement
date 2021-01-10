const {db} = require('../db');
const ObjectId = require('mongodb').ObjectId;
const Double = require('mongodb').Double;
const cloudinary = require('../cloudinary');
const cache = require('../lru-cache');


module.exports.list = async (pageIndex, itemPerPage, searchText, categoryId, brandId) => {

    const key = ['listProduct', pageIndex || 1, itemPerPage, searchText, categoryId, brandId].join('/');

    // get date from cache
    const value = await cache.get(key);
    if (value) return value;

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

    const listProduct = await db().collection('product').aggregate([
        { $match: filter },
        { $sort: { _id: -1 } },
        { $skip: itemPerPage * (page - 1) },
        { $limit: itemPerPage },
        { $lookup: {
            from: 'brand',
            localField: 'brand',
            foreignField: '_id',
            as: 'brand'
        }},
        { $unwind: '$brand' },
        { $lookup: {
            from: 'category',
            localField: 'category',
            foreignField: '_id',
            as: 'category'
        }},
        { $unwind: '$category' }
    ]).toArray();

    const data = { listProduct, page, lastPage };

    // cache date
    await cache.set(key, data);

    return data;
}

module.exports.delete = async (id) => {
    const product = await this.findOne(id);
    if (!product)
        return false;

    await Promise.all([
        cloudinary.destroyFiles(product.images_sources),
        db().collection('product').deleteOne({_id: product._id}),
        cache.clear()
    ]);

    cache.clearClientCache();
    
    return true;
}

module.exports.add = async (body, files) => {   

    const sources = await cloudinary.uploadFiles(files);
    
    await Promise.all([
        db().collection('product').insertOne({
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
        }),
        cache.clear()
    ]);

    cache.clearClientCache();
}

module.exports.update = async (data, files, id) => {
    const product = await this.findOne(id);
    if (!product)
        return false;

    let sources = null;
    if (files) {
        const destroyPromise = cloudinary.destroyFiles(product.images_sources);
        const new_sources = await cloudinary.uploadFiles(files);
        await destroyPromise;
        sources = [...new_sources];
    }

    await Promise.all([
        db().collection('product').updateOne( {_id: ObjectId(id)} ,{$set: {
            name: data.name, 
            price: Double(data.price),
            images_sources: sources ? sources : product.images_sources, 
            discount: Double(data.discount), 
            description: data.description, 
            brand: ObjectId(data.brand), 
            category: ObjectId(data.category)
        }}),
        cache.clear()
    ]);

    cache.clearClientCache();
    return true;
}

module.exports.listTopTenSeller = async (categoryId, brandId) => {
    const filter = getFilter(null, categoryId, brandId);
    return await db().collection('product').find(filter).sort({sell_count: -1}).limit(10).toArray();
}

module.exports.findOne = async (id) => {
    if (!ObjectId.isValid(id))
        return false;
    return await db().collection('product').findOne({_id: ObjectId(id)});
} 

module.exports.count = async (filter) => { 
    return await db().collection('product').countDocuments(filter); 
}

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
