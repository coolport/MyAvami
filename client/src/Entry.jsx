import { useForm } from "react-hook-form"
import { Box, Button } from "@chakra-ui/react";



function Entry() {

  // const { entry, handleSubmit, watch, formState: { errors } } = useForm();
  // const onSubmit = data => console.log(data);
  // console.log(watch("example"));

  const { register, handleSubmit } = useForm();

  async function onSubmit(data) {
    const { id } = req.params;
    console.log(data);
    console.log("id: ", id);

    const url = "http://localhost:5555/products";

    try {
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });
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
      <form onSubmit={handleSubmit(onSubmit)}>
        itemName: <input {...register("itemName")} />
        <br />
        itemDescription: <input {...register("itemDescription")} />
        <br />
        itemPrice: <input type="number"{...register("itemPrice")} />
        <br />
        itemExpiration: <input type="date"{...register("itemExpiration", { valueAsDate: true })} />
        <br />
        itemCount: <input type="number"{...register("itemCount", { min: 0, max: 99 })} />
        <br />
        itemImage: <input {...register("itemImage")} />
        <br />
        itemCategory: <input {...register("itemCategory")} />
        <br />
        <Button>
          <input type="submit" />
        </Button>
      </form>
      <br />
      <form onSubmit={handleSubmit(onDeleteSubmit)}>
        deleteId: <input {...register("deleteId")} />
        <Button>
          <input type="submit" />
        </Button>


      </form>

    </>
  )
};


export default Entry
