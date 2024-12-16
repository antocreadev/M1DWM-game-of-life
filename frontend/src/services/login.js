document.getElementById("loginForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const username = document.getElementById("username").value;
  const password = document.getElementById("password").value;
  const errorMessage = document.getElementById("errorMessage");

  try {
    const formData = new URLSearchParams();
    formData.append("username", username);
    formData.append("password", password);

    const response = await fetch("http://localhost:8090/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: formData,
    });

    if (!response.ok) {
      throw new Error("Erreur de connexion");
    }

    const data = await response.json();
    // Stockage du token dans le localStorage
    localStorage.setItem("token", data.access_token);
    // Redirection vers la page d'accueil
    window.location.href = "/";
  } catch (err) {
    errorMessage.textContent = "Nom d'utilisateur ou mot de passe incorrect";
    errorMessage.style.display = "block";
  }
});
