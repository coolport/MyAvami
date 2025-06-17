import mongoose from 'mongoose';

//Create a product schema
//schema defines struct of documents (records) in mdb collections
//defines fields(attrib) of object and what data type they are
const helpSchema = new mongoose.Schema(
  { //Fields definition (1st arg in schema func)
    helpQuestion: {
      type: String,
      required: true
    },
    helpAnswer: {
      type: String,
      required: true
    },
  }, { //Options Object (2nd argument in schema func)
  timestamps: true // createdAt, updatedAt (mongoose)
});

//Create model
//from docs: Models are fancy constructors compiled from Schema definitions. An instance of a model is called a document. 
//Models are responsible for creating and reading documents from the underlying MongoDB database.
const Help = mongoose.model('Help', helpSchema); //(CollectionName, CreatedSchema)
//'Product' (products as converted by mongoose) represents a mongodb collection
//each document inside this collection follows the mentioned schema

// now this is possible because we applied model constructor
// const newProduct = new Product({
//   name: 'Smartphone',
//   price: 799,
//   image: 'smartphone.jpg'
// });
// await newProduct.save(); // Saves to MongoDB

export default Help;


