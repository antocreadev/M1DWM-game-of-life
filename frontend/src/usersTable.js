import { getPlayerClass } from "./playerClass.js";
import { fetchAllUsers } from "./services/allUser.js";
let users = [];
let currentSort = {
  column: "elo",
  direction: "desc",
};

function sortUsers(column) {
  const direction =
    currentSort.column === column && currentSort.direction === "asc"
      ? "desc"
      : "asc";

  users.sort((a, b) => {
    let compareA, compareB;

    switch (column) {
      case "username":
        compareA = a.username.toLowerCase();
        compareB = b.username.toLowerCase();
        break;
      case "elo":
        compareA = a.elo || 1200;
        compareB = b.elo || 1200;
        break;
      case "class":
        compareA = getPlayerClass(a.elo || 1200);
        compareB = getPlayerClass(b.elo || 1200);
        break;
      default:
        return 0;
    }

    if (compareA < compareB) return direction === "asc" ? -1 : 1;
    if (compareA > compareB) return direction === "asc" ? 1 : -1;
    return 0;
  });

  currentSort = { column, direction };
  updateTable();
  updateSortIcons();
}

function updateSortIcons() {
  const headers = document.querySelectorAll("th.sortable");
  headers.forEach((header) => {
    header.classList.remove("sort-asc", "sort-desc");
    if (header.dataset.sort === currentSort.column) {
      header.classList.add(`sort-${currentSort.direction}`);
    }
  });
}

function updateTable() {
  const tableBody = document.getElementById("usersTableBody");
  tableBody.innerHTML = users
    .map(
      (user) => `
    <tr>
      <td>${user.username}</td>
      <td>${user.elo || 1200}</td>
      <td>${getPlayerClass(user.elo || 1200)}</td>
    </tr>
  `
    )
    .join("");
}

async function setupUsersTable() {
  // Récupération des utilisateurs
  users = await fetchAllUsers();
  sortUsers("elo"); // Tri initial par élo

  // Ajout des écouteurs d'événements pour le tri
  document.querySelectorAll("th.sortable").forEach((header) => {
    header.addEventListener("click", () => {
      sortUsers(header.dataset.sort);
    });
  });
}

setupUsersTable();
