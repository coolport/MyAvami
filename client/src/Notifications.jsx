import { HStack, Card, Button, Box, Stack, Image, Float, Table } from "@chakra-ui/react"
import { useEffect, useState } from "react"

function Notifications() {

  const [notifications, setNotifications] = useState([]);
  const [deleteConfirm, setDeleteConfirm] = useState(null)

  function handleDelete(notification) {
    // Put selected item in the deleteConfirm state, will render
    // the popup, n be target in confirmDelete
    setDeleteConfirm(notification)
  }

  async function confirmDelete() {
    const url = `http://localhost:5555/notifications/${deleteConfirm._id}`;
    console.log("deleteConfirm: ", deleteConfirm)
    console.log("Deleting ID:", deleteConfirm?._id);
    try {
      const response = await fetch(url, {
        method: "DELETE",
      });
      console.log("DELETE RESPONSE OBJ: ", response);

      if (response.ok) {
        // IF GOODS
        // 1. reset deleteConfirm state, unmountingit, and remove notif focus
        setDeleteConfirm(null);
        // 2. REFRESH LIST!
        getNotifications();
        alert("Notification Deleted");
      }
    } catch (error) {
      console.error("Delete error: ", error.message);
    }
  }

  function cancelDelete() {
    setDeleteConfirm(null)
  }

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

      {/* DELETE POPUP conditional */}
      {deleteConfirm && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          backgroundColor: 'rgba(0,0,0,0.5)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1000
        }}>
          <div style={{
            backgroundColor: 'white',
            padding: '20px',
            borderRadius: '5px',
            width: '300px',
            textAlign: 'center'
          }}>
            <h3>Confirm Delete</h3>
            <p>Delete Notification?</p>
            {/* <p>Employee: {deleteConfirm.transactionEmployee}</p> */}
            {/* <p>Total: PHP {deleteConfirm.transactionTotal}</p> */}
            <p>Test</p>
            <Button onClick={confirmDelete}>Delete</Button>
            <Button onClick={cancelDelete}>Cancel</Button>
          </div>
        </div>
      )}



      {notifications.map((notification, index) => (
        <Box width="50%" bgColor={"yellow"} key={index}>
          {/* color of container lol not visible bc of border radius 0 */}
          <Card.Root borderRadius={"0"}>
            <Stack>
              <Card.Header>{notification.notificationTitle}</Card.Header>
              {/* <Card.Header>PHP {item.itemPrice}</Card.Header> */}
              <Card.Body>
                {notification.notificationMessage}<br />
                {notification.notificationType}<br />
                {notification.notificationUserInvolved}
                {/* <Image rounded="md" src={item.itemImage} alt={item.itemName} /> */}
              </Card.Body>
              <Card.Footer>
                {/* <Button onClick={() => handleDelete(item)}>Delete</Button> */}
                <Button onClick={() => { handleDelete(notification) }}> Delete</Button>
              </Card.Footer>
            </Stack>
          </Card.Root>
        </Box>
      ))}
    </>
  )
}

export default Notifications
