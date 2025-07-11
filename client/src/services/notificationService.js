const url = `${import.meta.env.VITE_API_URL}/notifications`;

// destructure
export async function postNotifications({ type, title, message, userInvolved, itemInvolved }) {

  try {

    const body = {
      notificationType: type,
      notificationTitle: title,
      notificationMessage: message,
    }

    if (userInvolved) {
      body.notificationUserInvolved = userInvolved;
    }

    if (itemInvolved) {
      body.notificationItemInvolved = itemInvolved;
    }

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
      // body: JSON.stringify({
      //   notificationType: type,
      //   notificationTitle: title,
      //   notificationMessage: message,
      //   NotificationUser Invovled: triggeredBy,
      // })
    })

    if (!response.ok) {
      console.log("Failed to POST notification: ", await response.text());
    }
    console.log(response)

  } catch (error) {
    console.log("ERROR: ", error.message);
  }
};


