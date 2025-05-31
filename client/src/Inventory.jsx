import { useEffect } from "react"



function Inventory() {

  useEffect(() => {
    const url = "http://localhost:5555/products";
    async function fetchInventory() {
      try {
        const response = await fetch(url)
        const body = await response.json(); //returns promise obj with await
        console.log(body);
      } catch (error) {
        console.log(error.message);
      }
    }
    fetchInventory();
  }, []);

  return (
    <>
      <h1>Displaying Inventory Items:</h1>
    </>
  )
}


export default Inventory
