document
  .getElementById("registerForm")
  .addEventListener("submit", async (e) => {
    e.preventDefault();

    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;
    const errorMessage = document.getElementById("errorMessage");

    try {
      const response = await fetch("http://localhost:8090/users/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username,
          password,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.detail || "Erreur lors de l'inscription");
      }

      // Redirection vers la page de connexion après inscription réussie
      window.location.href = "/login";
    } catch (err) {
      errorMessage.textContent = err.message;
      errorMessage.style.display = "block";
    }
  });
