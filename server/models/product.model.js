import mongoose from 'mongoose';

//Create a product schema
//schema defines struct of documents (records) in mdb collections
//defines fields(attrib) of object and what data type they are
const productSchema = new mongoose.Schema(
  { //Fields definition (1st arg in schema func)
    itemName: {
      type: String,
      required: true
    },
    itemDescription: {
      type: String,
      required: true
    },
    itemCategory: {
      type: String,
      required: true
    },
    itemPrice: {
      type: Number,
      required: true
    },
    itemExpiration: {
      type: Date,
      required: false
    },
    itemCount: {
      type: Number,
      required: false
    },
    itemImage: {
      type: String,
      required: true
    },
  }, { //Options Object (2nd argument in schema func)
  timestamps: true // createdAt, updatedAt (mongoose)
});
// Example document (record): https://i.imgur.com/UyJqVSM.png

//Create model
//from docs: Models are fancy constructors compiled from Schema definitions. An instance of a model is called a document. 
//Models are responsible for creating and reading documents from the underlying MongoDB database.
const Product = mongoose.model('Product', productSchema); //(CollectionName, CreatedSchema)
//'Product' (products as converted by mongoose) represents a mongodb collection
//each document inside this collection follows the mentioned schema

// now this is possible because we applied model constructor
// const newProduct = new Product({
//   name: 'Smartphone',
//   price: 799,
//   image: 'smartphone.jpg'
// });
// await newProduct.save(); // Saves to MongoDB

export default Product;

