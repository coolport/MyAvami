const url = `${import.meta.env.VITE_API_URL}/auth/me`
export async function fetchUser() {
  try {
    const res = await fetch(url, {
      method: "GET",
      credentials: "include",
    });

    if (res.ok) {
      const data = await res.json();
      return data.user.role
    } else {
      console.error("Failed to fetch user");
    }
  } catch (err) {
    console.error("Error fetching user:", err);
  }
};
