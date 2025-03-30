// Import Firestore functions
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.5.0/firebase-app.js";

import {
  getFirestore,
  collection,
  addDoc,
  deleteDoc,
  updateDoc ,
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

  //  EDIT STUDENT FUNCTION
  async function editStudent(studentId) {
    const studentRef = doc(db, "students", studentId);
    const studentSnap = await getDoc(studentRef);

    if (studentSnap.exists()) {
      const student = studentSnap.data();
      const newFirstName = prompt("Enter new first name:", student.first_name);
      const newSurname = prompt("Enter new surname:", student.surname);
      const newGender = prompt("Enter new gender:", student.gender);
      const newCampus = prompt("Enter new campus:", student.campus);
      const newSkills = prompt("Enter new skills:", student.skills);
      const newPhone = prompt("Enter new phone:", student.phone);
      const newEmail = prompt("Enter new email:", student.email);

      if (
        newFirstName &&
        newSurname &&
        newGender &&
        newCampus &&
        newSkills &&
        newPhone &&
        newEmail
      ) {
        try {
          await updateDoc(studentRef, {
            first_name: newFirstName,
            surname: newSurname,
            gender: newGender,
            campus: newCampus,
            skills: newSkills,
            phone: newPhone,
            email: newEmail,
          });

          console.log("✅ Student updated successfully!");
          renderStudents();
        } catch (error) {
          console.error("❌ Error updating student:", error);
        }
      } else {
        console.log("❌ Update canceled! Some fields were empty.");
      }
    } else {
      console.log("❌ Student not found!");
    }
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
});
