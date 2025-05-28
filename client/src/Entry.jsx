import { useForm } from "react-hook-form"
import { Box, Button } from "@chakra-ui/react";



function Entry() {

  // const { entry, handleSubmit, watch, formState: { errors } } = useForm();
  // const onSubmit = data => console.log(data);
  // console.log(watch("example"));

  const { register, handleSubmit } = useForm();

  async function onSubmit(data) {
    console.log(data)

    const url = "http://localhost:5555"

    try {
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data)
      });
      console.log(response)
    } catch (error) {
      console.error(error.message)
    }
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
        itemExpiration: <input type="date"{...register("itemExpiration")} />
        <br />
        itemCount: <input type="number"{...register("itemCount", { min: 0, max: 99 })} />
        <br />
        itemImage: <input {...register("itemImage")} />

        {/* name */}
        {/* id */}
        {/* price */}
        {/* count */}
        {/* image */}

        {/* <select {...register("gender")}> */}
        {/*   <option value="female">female</option> */}
        {/*   <option value="male">male</option> */}
        {/*   <option value="other">other</option> */}
        {/* </select> */}

        <br />
        <Button>
          <input type="submit" />
        </Button>
      </form>
    </>
  )
}


export default Entry
