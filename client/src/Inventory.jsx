import { useEffect, useState } from "react"
import { HStack, Card, Button, Box, Stack, Image, Float } from "@chakra-ui/react"



function Inventory() {

  const [inventory, setInventory] = useState([])
  // useEffect(() => {
  //   const url = "http://localhost:5555/products";
  //   async function fetchInventory() {
  //     try {
  //       const response = await fetch(url)
  //       const body = await response.json(); //returns promise obj with await
  //       console.log(body);
  //     } catch (error) {
  //       console.log(error.message);
  //     }
  //   }
  //   fetchInventory();
  // }, []);


  useEffect(() => {
    getItems()
    // setItems([...data[0]]) 
    console.log("Called getPosts() - useEffect")
    //bmindful lang abt other logs, since state updates are async, as well as in this case, the func ur calling
  }, []) //dependency array: nothing, just run at start (when component is first mounted)

  //note: this can be defined inside useffect if once gagamitin
  //para ma avoid na rin yung pag call niya twice...
  //tho u can make only the console logs there but ofc u need define shit again and refactor some code properly
  //but in this case dun mo nalang deifne lol (if u want), though its gonna be added to the dependency array
  async function getItems() {
    const url = "http://localhost:5555/products"

    try {
      const response = await fetch(url)
      if (!response.ok) {
        throw new Error(`Response status: ${response.status}`)
      }
      const updatedArray = []
      const json = await response.json()
      //json object, has data,string,success (as defined in endpoint definition)
      const data = json.data
      for (const x in data) {
        console.log(`data[${x}]`, data[x])
        updatedArray.push(data[x])
      }
      setInventory(updatedArray)
    } catch (e) {
      console.error(e)
    }
  }

  return (
    <>
      <h1>Displaying Inventory Items:</h1>
      <HStack scale="auto">
        {/* <Stack> */}
      </HStack>
      {inventory.map((item, index) => (
        <Box width="50%" bgColor={"yellow"}>
          {/* color of container lol not visibile bc of border radius 0 */}
          <Card.Root borderRadius={"0"} key={index}>
            <Stack>
              <Card.Header>{item.itemName}</Card.Header>
              <Card.Header>PHP {item.itemPrice}</Card.Header>
              <Card.Body>{item.itemDescription}
                <Image rounded="md" src={item.itemImage} alt="Dan Abramov" />
              </Card.Body >
              <Card.Footer>
                <Button>Edit</Button>
                <Button>Delete</Button>
              </Card.Footer >

            </Stack>
          </Card.Root>
        </Box >
      ))};
    </>
  )
}


export default Inventory
