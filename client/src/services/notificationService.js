const url = "http://localhost:5555/notifications";

// destructure
export async function postNotifications({ type, title, message, triggeredBy }) {

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        type,
        title,
        message,
        triggeredBy,
      })
    })

    if (!response.ok) {
      console.log("Failed to POST notification: ", await response.text());
    }
    console.log(response)

  } catch (error) {
    console.log("ERROR: ", error.message);
  }
};


