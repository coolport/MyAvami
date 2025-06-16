//SQL vs NO-SQL
// Tables (rows -> columns) vs Collections (collections -> records (documents))

//this file simply connects to db
import mongoose from 'mongoose';

export const connectDB = async () => {
  try {
    // const conn = await mongoose.connect(old atlas connection uri);

    // sa windows, same lang, start mongod service, which will start a mongodb instance
    // on the default port (hopefully 27017 din)
    // ung maiiba lang talaga is this line / env variable
    //const conn = await mongoose.connect(process.env.MONGO_URI);

    //dito pala galing name ng db wtf
    //end of url u get to name it,
    //if walang nakalagay, defaults to app name (package.json, etc ,etc) or other 
    //places 
    const conn = await mongoose.connect("mongodb://localhost:27017/myavamifinal");
    console.log(`MongoDB Connected: ${conn.connection.host}`);

  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1); // exit with failure, 0 is success
  }
}

// connection to mongodb atlas lookedl ike this
// MONGO_URI='mongodb+srv://aidanalcayde:PASSWORDHERE@cluster0.lp1pe.mongodb.net/products?retryWrites=true&w=majority&appName=Cluster0'
// console.log(`Mongo URI: ${process.env.MONGO_URI}`);
