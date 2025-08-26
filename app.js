// ✅ Firebase
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-app.js";
import { getDatabase, ref, child, push, set, onValue, get, update, remove } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-database.js";

// 🔑 Config
const firebaseConfig = {
  apiKey: "AIzaSyDPFMGEA0TNAEMzrBnZqNKGaWBYrJghigM",
  authDomain: "taymourstudents.firebaseapp.com",
  databaseURL: "https://taymourstudents-default-rtdb.firebaseio.com",
  projectId: "taymourstudents",
  storageBucket: "taymourstudents.firebasestorage.app",
  messagingSenderId: "223391991965",
  appId: "1:223391991965:web:76380a231c8f3044d66c74",
  measurementId: "G-5RW0302WTE"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);
const dbRef = ref(db, "school_years");

let currentYearId = null;
let editingYearId = null;
let editingStudentId = null;

// DOM
const yearList = document.getElementById("yearList");
const studentPageTitle = document.getElementById("studentPageTitle");
const studentList = document.getElementById("studentList");
const studentDetails = document.getElementById("studentDetails");
const searchBox = document.getElementById("searchBox");
const editStudentBtn = document.getElementById("editStudentBtn");
const deleteStudentBtn = document.getElementById("deleteStudentBtn");

// 🏫 عرض السنوات
function renderYears() {
  onValue(dbRef, snapshot => {
    yearList.innerHTML = "";
    const years = snapshot.val() || {};
    Object.keys(years).forEach(yearId => {
      const year = years[yearId];
      const li = document.createElement("li");
      li.innerHTML = `<span class="material-icons">calendar_month</span> ${year.name}`;
      
      // أزرار تعديل/حذف
      const actions = document.createElement("div");
      actions.className = "actions";
      const editBtn = document.createElement("button");
      editBtn.innerHTML = `<span class="material-icons">edit</span>`;
      editBtn.onclick = e => {
        e.stopPropagation();
        editingYearId = yearId;
        document.getElementById("yearName").value = year.name;
        openModal("yearModal");
      };

      const deleteBtn = document.createElement("button");
      deleteBtn.innerHTML = `<span class="material-icons">delete</span>`;
      deleteBtn.onclick = e => {
        e.stopPropagation();
        if (confirm("هل أنت متأكد من حذف السنة؟")) {
          remove(child(dbRef, yearId));
        }
      };

      actions.appendChild(editBtn);
      actions.appendChild(deleteBtn);
      li.appendChild(actions);

      li.onclick = () => openStudents(yearId);
      yearList.appendChild(li);
    });
  });
}

// ➕ حفظ/تعديل سنة
function saveYear() {
  const name = document.getElementById("yearName").value;
  if (!name) return;

  if (editingYearId) {
    update(child(dbRef, editingYearId), { name });
    editingYearId = null;
  } else {
    const newYearRef = push(dbRef);
    set(newYearRef, { name, students: {} });
  }
  closeModal("yearModal");
}

// 👥 فتح الطلاب
function openStudents(yearId) {
  currentYearId = yearId;
  const yearRef = child(dbRef, yearId);

  onValue(yearRef, snapshot => {
    const year = snapshot.val();
    studentPageTitle.textContent = `👥 الطلاب - ${year.name}`;
    renderStudents(year.students || {});
  });

  showPage("studentPage");
}

// 📋 عرض الطلاب
function renderStudents(students) {
  studentList.innerHTML = "";
  Object.keys(students).forEach(studentId => {
    const student = students[studentId];
    const li = document.createElement("li");
    li.innerHTML = `<span class="material-icons">person</span> ${student.fullName}`;

    const actions = document.createElement("div");
    actions.className = "actions";

    const editBtn = document.createElement("button");
    editBtn.innerHTML = `<span class="material-icons">edit</span>`;
    editBtn.onclick = e => {
      e.stopPropagation();
      editingStudentId = studentId;
      document.getElementById("studentName").value = student.fullName;
      document.getElementById("studentAddress").value = student.address;
      document.getElementById("studentPhone").value = student.phoneNumbers[0];
      document.getElementById("studentReceipt").value = student.receiptNumber;
      openModal("studentModal");
    };

    const deleteBtn = document.createElement("button");
    deleteBtn.innerHTML = `<span class="material-icons">delete</span>`;
    deleteBtn.onclick = e => {
      e.stopPropagation();
      if (confirm("هل أنت متأكد من حذف الطالب؟")) {
        remove(child(dbRef, `${currentYearId}/students/${studentId}`));
      }
    };

    actions.appendChild(editBtn);
    actions.appendChild(deleteBtn);
    li.appendChild(actions);

    li.onclick = () => openStudentDetails(studentId);
    studentList.appendChild(li);
  });
}

// ➕ حفظ/تعديل طالب
function saveStudent() {
  const name = document.getElementById("studentName").value;
  const address = document.getElementById("studentAddress").value;
  const phone = document.getElementById("studentPhone").value;
  const receipt = document.getElementById("studentReceipt").value;
  if (!name) return;

  if (editingStudentId) {
    update(child(dbRef, `${currentYearId}/students/${editingStudentId}`), {
      fullName: name,
      address: address || "غير محدد",
      phoneNumbers: [phone || "غير محدد"],
      receiptNumber: receipt || "غير محدد"
    });
    editingStudentId = null;
  } else {
    const studentRef = push(child(dbRef, `${currentYearId}/students`));
    set(studentRef, {
      fullName: name,
      address: address || "غير محدد",
      phoneNumbers: [phone || "غير محدد"],
      receiptNumber: receipt || "غير محدد"
    });
  }
  closeModal("studentModal");
}

// 📖 تفاصيل الطالب
function openStudentDetails(studentId) {
  const studentRef = child(dbRef, `${currentYearId}/students/${studentId}`);
  get(studentRef).then(snapshot => {
    const student = snapshot.val();
    studentDetails.innerHTML = `
      <p><span class="material-icons">badge</span> الاسم: ${student.fullName}</p>
      <p><span class="material-icons">home</span> العنوان: ${student.address}</p>
      <p><span class="material-icons">call</span> الهاتف: ${student.phoneNumbers.join(", ")}</p>
      <p><span class="material-icons">receipt</span> رقم الإيصال: ${student.receiptNumber}</p>
    `;
    editStudentBtn.onclick = () => {
      editingStudentId = studentId;
      document.getElementById("studentName").value = student.fullName;
      document.getElementById("studentAddress").value = student.address;
      document.getElementById("studentPhone").value = student.phoneNumbers[0];
      document.getElementById("studentReceipt").value = student.receiptNumber;
      openModal("studentModal");
    };
    deleteStudentBtn.onclick = () => {
      if (confirm("هل أنت متأكد من حذف الطالب؟")) {
        remove(studentRef);
        goBack("studentPage");
      }
    };
    showPage("detailsPage");
  });
}

// 🔍 البحث
function searchStudent() {
  const query = searchBox.value.toLowerCase();
  if (!currentYearId) return;
  const yearRef = child(dbRef, currentYearId);

  get(yearRef).then(snapshot => {
    const year = snapshot.val();
    const students = year.students || {};
    const filtered = {};
    Object.keys(students).forEach(id => {
      if (students[id].fullName.toLowerCase().includes(query)) {
        filtered[id] = students[id];
      }
    });
    renderStudents(filtered);
  });
}

// 📌 التحكم في الصفحات
function showPage(pageId) {
  document.querySelectorAll(".page").forEach(p => p.classList.remove("active"));
  document.getElementById(pageId).classList.add("active");
}
function goBack(toPage) {
  showPage(toPage);
}

// 🔲 المودال
function openModal(id) {
  document.getElementById(id).style.display = "flex";
}
function closeModal(id) {
  document.getElementById(id).style.display = "none";
}

// 🚀 تشغيل أول مرة
renderYears();

// 🛠 export
window.goBack = goBack;
window.openModal = openModal;
window.closeModal = closeModal;
window.saveYear = saveYear;
window.saveStudent = saveStudent;
window.searchStudent = searchStudent;
