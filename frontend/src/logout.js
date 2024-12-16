function setupLogout() {
  document.getElementById("logoutBtn").addEventListener("click", () => {
    console.log("logoutBtn");
    localStorage.removeItem("token");
    window.location.href = "/login";
  });
}

setupLogout();
