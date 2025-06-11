import { HStack, Card, Button, Box, Stack, Image, Float, Table } from "@chakra-ui/react"
import { useEffect, useState } from "react"

function Notifications() {

  const [notifications, setNotifications] = useState([]);

  async function getNotifications() {
    const url = "http://localhost:5555/notifications";
    try {
      const response = await fetch(url);
      const json = await response.json();
      const notificationsJSON = json.data;
      // console.log(notificationsJSON);
      // console.log(notificationsJSON[1])
      const updatedArray = [];

      for (const x in notificationsJSON) {
        // console.log(notificationsJSON[x]);
        updatedArray.push(notificationsJSON[x]);
      }
      console.log("Updated Array: ", updatedArray);
      setNotifications(updatedArray);
    } catch (error) {
      console.error("Server error:", error.message);
    }
  }

  useEffect(() => {
    getNotifications();
    console.log("getNotifications() Triggered")
  }, [])

  return (
    <>
      {notifications.map((notification, index) => (
        <Box width="50%" bgColor={"yellow"} key={index}>
          {/* color of container lol not visible bc of border radius 0 */}
          <Card.Root borderRadius={"0"}>
            <Stack>
              <Card.Header>{notification.notificationTitle}</Card.Header>
              {/* <Card.Header>PHP {item.itemPrice}</Card.Header> */}
              <Card.Body>
                {notification.notificationMessage}
                {/* <Image rounded="md" src={item.itemImage} alt={item.itemName} /> */}
              </Card.Body>
              <Card.Footer>
                {/* <Button onClick={() => handleDelete(item)}>Delete</Button> */}
                {notification.notificationType}
                {notification.notificationUserInvolved}
              </Card.Footer>
            </Stack>
          </Card.Root>
        </Box>
      ))}
    </>
  )
}

export default Notifications
