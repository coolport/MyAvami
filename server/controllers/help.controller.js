
import Help from "../models/help.model.js";
import mongoose from 'mongoose';



export const getHelp = async (req, res) => {
  try {
    const helpData = await Help.find({}); //returns all products, see docs for things u can {query}
    res.status(200).json({ success: true, data: helpData, string: "hi" });
    // res.status(200).json({ data: products });  trying this for json parse unexpected char at line 1 error in client


  } catch (error) {
    console.error("Error fetching products: ", error.message);
    res.status(500).json({ success: false, message: "Server error" });
  }
}


export const postHelp = async (req, res) => {
  const body = req.body;
  if (Array.isArray(body)) {
    const isValid = body.every(p =>
      p.helpQuestion &&
      p.helpAnswer
    );
    if (!isValid) {
      return res.status(400).json({ success: false, message: "Please provide all fields for every entry" });
    }

    try {
      const newHelp = await Help.insertMany(body);
      res.status(201).json({ success: true, data: newHelp });
    } catch (error) {
      console.error("Error: ", error.message);
      res.status(500).json({ success: false, message: "Server Error" });
    }

  } else {

    const help = req.body; //Return Value: Object 
    // The req.body property is used to access the data sent by the client in POST requests. 
    if (!help.helpQuestion || !help.helpAnswer) {
      return res.status(400).json({ success: false, message: "Please provide all fields" })
    }

    const newHelp = new Help(help)
    //create new instance of Product model using data received from the product request.
    //aka a document. an instandce of a model is a document. aka record. see model file docs

    try {
      await newHelp.save();
      console.log('REQPARAMS: ', req.body);
      res.status(201).json({ success: true, data: newHelp });

    } catch (error) {
      console.error("Error in Create Product: ", error.message);
      res.status(500).json({ success: false, message: "Server Error" });
      //you can chain this because .status() method returns a response object.
      //Status Code: 500
      //Headers: Content-Type: application/json
      //Body: '{ "success": false, "message": "Server Error" }'
    }
  }
}


//patch - update some fields
//put - update "all" fields both pretty specific use cases tho
//put and patch both can be used in this simple case, i tested and its fine
export const putHelp = async (req, res) => {
  const { id } = req.params;
  const product = req.body;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(404).json({ success: false, message: "Invalid Product Id" });
  }

  try {
    const updatedHelp = await Help.findByIdAndUpdate(id, product, { new: true }); //check new docs/tooltip (mongoose query prop)
    res.status(200).json({ success: true, data: updatedHelp });

  } catch (error) {
    console.error("Error in PUTTING Help: ", error.message);
    res.status(500).json({ success: false, message: "Server Error" });
  }
}


export const deleteHelp = async (req, res) => {
  const { id } = req.params; //get "dynamic" id via deconstruction
  console.log(req.params);
  console.log("id:", id);

  try {
    // await Product.findById(id);
    await Help.findByIdAndDelete(id)
    console.log('REQPARAMS: ', req.params);
    res.status(200).json({ success: true, message: "Product Deleted" });

    // /products/theIDbelow  
    // id: 67d5a039f9908df397e708c5
    // REQPARAMS:  { id: '67d5a039f9908df397e708c5' }

  } catch (error) {
    console.error("Error: ", error.message);
    res.status(500).json({ success: false, message: "Server error" });
  }
}
