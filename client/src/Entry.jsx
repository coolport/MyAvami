import { useForm } from "react-hook-form"
import { Box, Button } from "@chakra-ui/react";



function Entry() {

  // const { entry, handleSubmit, watch, formState: { errors } } = useForm();
  // const onSubmit = data => console.log(data);
  // console.log(watch("example"));

  // const { register, handleSubmit } = useForm();
  const createForm = useForm();
  const deleteForm = useForm();

  async function onSubmit(data) {
    const url = "http://localhost:5555/products";

    try {
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });
      console.log(response);
    } catch (error) {
      console.error(error.message);
    }
  }

  // Base delete func to work with
  // Handle: id not found, check auth/accesslevel?
  // Better logging.. errors r ambiguous
  async function onDeleteSubmit(data) {
    const id = data.deleteId;
    console.log("Deleting ID: ", id);
    const url = `http://localhost:5555/products/${id}`;

    try {
      const response = await fetch(url, {
        method: "DELETE",
      });
      console.log("Response: ", response);
    } catch (error) {
      console.error(error.message);
    };
  }

  return (
    <>
      <form onSubmit={createForm.handleSubmit(onSubmit)}>
        itemName: <input {...createForm.register("itemName")} />
        <br />
        itemDescription: <input {...createForm.register("itemDescription")} />
        <br />
        itemPrice: <input type="number" {...createForm.register("itemPrice")} />
        <br />
        itemExpiration: <input type="date" {...createForm.register("itemExpiration", { valueAsDate: true })} />
        <br />
        itemCount: <input type="number" {...createForm.register("itemCount", { min: 0, max: 99 })} />
        <br />
        itemImage: <input {...createForm.register("itemImage")} />
        <br />
        itemCategory: <input {...createForm.register("itemCategory")} />
        <br />
        <Button type="submit">Submit</Button>
      </form >
      <br />
      <form onSubmit={deleteForm.handleSubmit(onDeleteSubmit)}>
        deleteId: <input {...deleteForm.register("deleteId")} />
        {/* <Button> */}
        {/*   <input type="submit" /> */}
        {/* </Button> */}
        <Button type="submit">Delete</Button>


      </form>

    </>
  )
};


export default Entry
