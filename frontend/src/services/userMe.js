const token = localStorage.getItem("token");

async function fetchUserInfo() {
  try {
    const response = await fetch("http://localhost:8090/users/me/", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error("Erreur lors de la récupération des informations");
    }

    const userData = await response.json();
    console.log(userData);
    document.getElementById("username").textContent = userData.username;
    document.getElementById("userId").textContent = userData.id;
    // ajoute dans le localstorale le username
    localStorage.setItem("username", userData.username);
  } catch (err) {
    console.error(err);
    window.location.href = "/login";
  }
}

fetchUserInfo();
