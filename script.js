// Import Firestore functions
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.5.0/firebase-app.js";

import {
  getFirestore,
  collection,
  addDoc,
  deleteDoc,
  updateDoc,
  doc,
  getDoc,
  getDocs,
  query,
  where,
  serverTimestamp,
} from "https://www.gstatic.com/firebasejs/11.5.0/firebase-firestore.js";

// ✅ Initialize Firebase
const firebaseConfig = {
  apiKey: "AIzaSyBJrYJeN67HcpW4wm--l7idb9Nbk3QMll8",
  authDomain: "studentapp-d41f8.firebaseapp.com",
  projectId: "studentapp-d41f8",
  storageBucket: "studentapp-d41f8.appspot.com",
  messagingSenderId: "807861020736",
  appId: "1:807861020736:web:d2b72e83c7da0e0e6997a5",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

document.addEventListener("DOMContentLoaded", function () {
  console.log("✅ Script Loaded...");

  // ✅ Initialize EmailJS
  if (typeof emailjs !== "undefined") {
    emailjs.init("zC_sxW3gAS0GI38xw");
    console.log("✅ EmailJS Initialized...");
  } else {
    console.error("❌ EmailJS not loaded! Check your script import.");
  }

  const studentForm = document.getElementById("studentForm");
  const loginForm = document.getElementById("loginForm");
  const studentsTableBody = document.querySelector("#studentsTable tbody");
  const printButton = document.getElementById("printButton");
  const logoutButton = document.getElementById("logoutButton");

  // Function to capitalize the first letter of each word
  function capitalizeWords(str) {
    return str
      .toLowerCase()
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  }

  // REGISTER STUDENT & FORMAT INPUT
  if (studentForm) {
    studentForm.addEventListener("submit", async function (event) {
      event.preventDefault();

      const first_name = capitalizeWords(
        document.getElementById("first_name").value.trim()
      );
      const surname = capitalizeWords(
        document.getElementById("surname").value.trim()
      );
      const gender = capitalizeWords(
        document.getElementById("gender").value.trim()
      );
      const campus = capitalizeWords(
        document.getElementById("campus").value.trim()
      );
      const skills = capitalizeWords(
        document.getElementById("skills").value.trim()
      );
      const phone = document.getElementById("phone").value.trim();
      const email = document.getElementById("email").value.trim().toLowerCase(); // Ensure email is lowercase
      const registerMessage = document.getElementById("registerMessage");

      if (
        first_name &&
        surname &&
        gender &&
        campus &&
        skills &&
        phone &&
        email
      ) {
        try {
          //Check if student already exists
          const studentsRef = collection(db, "students"); // Reference to Firestore collection
          const q = query(
            studentsRef,
            where("first_name", "==", first_name),
            where("surname", "==", surname),
            where("gender", "==", gender),
            where("phone", "==", phone)
          );

          const querySnapshot = await getDocs(q);

          if (!querySnapshot.empty) {
            //  Duplicate student found
            registerMessage.textContent = "❌ Student is already registered!";
            registerMessage.className = "message error";
            registerMessage.style.display = "block";
            setTimeout(() => {
              registerMessage.style.display = "none";
            }, 3000);
            return;
          }

          // If no duplicate, register student
          await addDoc(studentsRef, {
            first_name,
            surname,
            gender,
            campus,
            skills,
            phone,
            email,
            timestamp: serverTimestamp(),
          });

          registerMessage.textContent = "✅ Registration successful!";
          registerMessage.className = "message success";
          registerMessage.style.display = "block";

          setTimeout(() => {
            registerMessage.style.display = "none";
          }, 3000);

          studentForm.reset();

          //  Send Email Notification
          emailjs
            .send(
              "sirlawid2000",
              "template_awf2aof",
              {
                first_name: first_name,
                surname: surname,
                email: email,
                campus: campus,
                skills: skills,
              },
              "zC_sxW3gAS0GI38xw"
            )
            .then((response) => {
              console.log("✅ Email sent!", response);
            })
            .catch((error) => {
              console.error("❌ Email failed!", error);
            });
        } catch (error) {
          console.error("❌ Error saving data:", error);
        }
      } else {
        registerMessage.textContent = "❌ Please fill in all fields!";
        registerMessage.className = "message error";
        registerMessage.style.display = "block";

        setTimeout(() => {
          registerMessage.style.display = "none";
        }, 3000);
      }
    });
  }

  // ✅ ADMIN LOGIN
  if (loginForm) {
    loginForm.addEventListener("submit", function (event) {
      event.preventDefault();

      const usernameField = document.getElementById("adminUsername");
      const passwordField = document.getElementById("adminPassword");
      const loginMessage = document.getElementById("loginMessage");

      if (!usernameField || !passwordField) {
        console.error("❌ Username or Password field is missing!");
        return;
      }

      const username = usernameField.value.trim();
      const password = passwordField.value.trim();

      const validUsername = "admin";
      const validPassword = "admin123";

      if (username === validUsername && password === validPassword) {
        localStorage.setItem("adminLoggedIn", "true");
        loginMessage.textContent = "✅ Login successful!";
        loginMessage.className = "message success";
        loginMessage.style.display = "block";

        setTimeout(() => {
          window.location.href = "admin.html";
        }, 1500);
      } else {
        loginMessage.textContent = "❌ Invalid username or password!";
        loginMessage.className = "message error";
        loginMessage.style.display = "block";

        setTimeout(() => {
          loginMessage.style.display = "none";
        }, 3000);
      }
    });
  }

  //  FETCH & DISPLAY STUDENTS FROM FIRESTORE (With Serial Number)
  async function renderStudents() {
    studentsTableBody.innerHTML = "";

    const querySnapshot = await getDocs(collection(db, "students"));
    let count = 1;

    if (querySnapshot.empty) {
      studentsTableBody.innerHTML = `<tr><td colspan="9">No students found.</td></tr>`;
      return;
    }

    querySnapshot.forEach((doc) => {
      let student = doc.data();
      let row = `<tr>
            <td>${count}</td>  <!-- Serial Number Column -->
            <td>${student.first_name}</td>
            <td>${student.surname}</td>
            <td>${student.gender}</td>
            <td>${student.campus}</td>
            <td>${student.skills}</td>
            <td>${student.phone}</td>
            <td>${student.email}</td>
            <td>
                <button class="edit-btn" data-id="${doc.id}">Edit</button>
                <button class="delete-btn" data-id="${doc.id}">Delete</button>
            </td>
        </tr>`;
      studentsTableBody.innerHTML += row;
      count++;
    });

    document.querySelectorAll(".delete-btn").forEach((button) => {
      button.addEventListener("click", function () {
        const studentId = this.getAttribute("data-id");
        if (confirm("Are you sure you want to delete this student?")) {
          deleteStudent(studentId);
        }
      });
    });

    document.querySelectorAll(".edit-btn").forEach((button) => {
      button.addEventListener("click", function () {
        const studentId = this.getAttribute("data-id");
        editStudent(studentId);
      });
    });
  }

  if (window.location.pathname.includes("admin.html")) {
    renderStudents();
  }

  //  DELETE STUDENT FUNCTION
  async function deleteStudent(studentId) {
    try {
      await deleteDoc(doc(db, "students", studentId));
      console.log("✅ Student deleted successfully!");
      renderStudents(); // Refresh the list
    } catch (error) {
      console.error("❌ Error deleting student:", error);
    }
  }

  // Function to enable inline editing for a student row
  async function editStudent(studentId) {
    const row = document
      .querySelector(`button[data-id="${studentId}"]`)
      .closest("tr");

    if (!row) return;

    // Get all cells except action buttons
    const cells = row.querySelectorAll("td:not(:first-child):not(:last-child)");

    // Store original values in case of cancel
    const originalValues = Array.from(cells).map((cell) =>
      cell.textContent.trim()
    );

    // Convert each cell into an input field
    cells.forEach((cell) => {
      const input = document.createElement("input");
      input.type = "text";
      input.value = cell.textContent.trim();
      cell.textContent = "";
      cell.appendChild(input);
    });

    // Change "Edit" button to "Save" and add a "Cancel" button
    const actionsCell = row.lastElementChild;
    actionsCell.innerHTML = `
      <button class="save-btn" data-id="${studentId}">Save</button>
      <button class="cancel-btn">Cancel</button>
  `;

    // Handle "Save" click
    actionsCell
      .querySelector(".save-btn")
      .addEventListener("click", async function () {
        const updatedValues = Array.from(cells).map((cell) =>
          cell.firstElementChild.value.trim()
        );

        // Update Firestore
        try {
          const studentRef = doc(db, "students", studentId);
          await updateDoc(studentRef, {
            first_name: updatedValues[0],
            surname: updatedValues[1],
            gender: updatedValues[2],
            campus: updatedValues[3],
            skills: updatedValues[4],
            phone: updatedValues[5],
            email: updatedValues[6],
          });

          console.log("✅ Student updated successfully!");
          renderStudents(); // Re-render the table
        } catch (error) {
          console.error("❌ Error updating student:", error);
        }
      });

    // Handle "Cancel" click
    actionsCell
      .querySelector(".cancel-btn")
      .addEventListener("click", function () {
        // Restore original values
        cells.forEach((cell, index) => {
          cell.textContent = originalValues[index];
        });

        // Restore action buttons
        actionsCell.innerHTML = `
          <button class="edit-btn" data-id="${studentId}">Edit</button>
          <button class="delete-btn" data-id="${studentId}">Delete</button>
      `;

        // Reattach event listeners
        actionsCell
          .querySelector(".edit-btn")
          .addEventListener("click", () => editStudent(studentId));
        actionsCell
          .querySelector(".delete-btn")
          .addEventListener("click", () => deleteStudent(studentId));
      });
  }

  //  LOGOUT FUNCTION
  if (logoutButton) {
    logoutButton.addEventListener("click", () => {
      localStorage.removeItem("adminLoggedIn");
      window.location.href = "index.html";
    });
  }

  //  PRINT FUNCTION
  if (printButton) {
    printButton.addEventListener("click", function () {
      document.body.classList.add("print-mode");
      window.print();
      document.body.classList.remove("print-mode");
    });
  }






  document.addEventListener("DOMContentLoaded", function () {
    const passwordField = document.getElementById("adminPassword");
    const toggleButton = document.getElementById("togglePassword");

    toggleButton.addEventListener("click", function () {
        if (passwordField.type === "password") {
            passwordField.type = "text";
            toggleButton.textContent = "👁️‍🗨️"; // Hide icon
        } else {
            passwordField.type = "password";
            toggleButton.textContent = "👁️"; // Show icon
        }
    });
});





// Function to add spinner to all buttons when clicked
document.querySelectorAll("button").forEach((button) => {
  // Create a spinner element
  const spinner = document.createElement("span");
  spinner.classList.add("loader");

  // Append spinner to the button
  button.appendChild(spinner);

  button.addEventListener("click", function () {
    // Show loading effect
    button.classList.add("loading");
    spinner.style.display = "inline-block"; // Show spinner

    // Simulate delay (remove spinner after 2 seconds)
    setTimeout(() => {
      button.classList.remove("loading");
      spinner.style.display = "none"; // Hide spinner
    }, 2000);
  });
});






// Function to handle network status
function handleNetworkStatus() {
  const overlay = document.getElementById("networkOverlay");
  const isOnline = navigator.onLine;

  if (isOnline) {
    overlay.style.display = "none"; // Hide overlay when online
  } else {
    overlay.style.display = "flex"; // Show overlay when offline
  }
}

// Check network on page load & listen for changes
window.addEventListener("load", handleNetworkStatus);
window.addEventListener("online", handleNetworkStatus);
window.addEventListener("offline", handleNetworkStatus);












});
