export async function fetchAllUsers() {
  const token = localStorage.getItem("token");
  try {
    const response = await fetch("http://localhost:8090/users/", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error("Erreur lors de la récupération des utilisateurs");
    }

    return await response.json();
  } catch (err) {
    console.error(err);
    return [];
  }
}
