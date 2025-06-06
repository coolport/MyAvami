import { useState } from "react"
import { Button } from "@chakra-ui/react";
import { useEffect } from "react";

function Home() {
  const [clicks, updateClick] = useState(0);
  const [visits, setVisits] = useState();

  useEffect(() => {
    const url = "http://localhost:5555/";

    (async () => {
      try {
        const res = await fetch(url);
        const parsed = await res.json()
        console.log(res)
        console.log(parsed)
        console.log(parsed.visits)
        const pageVisits = setVisits(parsed.visits)
      } catch (error) {
        console.error(error.message);
      }
    })()

  }, [])


  function changeClick() {
    updateClick(clicks => clicks + 1);
  }

  return (
    <>
      <h1>Home Screen Placeholder</h1>
      <p>{clicks}</p>
      <Button onClick={changeClick}>Update</Button>
      <h2>Visits: {visits}</h2>
    </>
  )
}


export default Home
