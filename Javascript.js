// ========================================
// GLORY REGIN PREPARATORY SCHOOL - MANAGEMENT SYSTEM
// JavaScript Functionality
// ========================================

// ========================================
// Global Variables & Data Storage
// ========================================

let currentUser = null;
let students = [];
let teachers = [];
let attendance = [];
let grades = [];
let fees = [];
let notices = [];
let users = [];
let feeStructures = [];
let paymentHistory = [];

// Editing state trackers
let editingStudentId = null;
let editingAttendanceIndex = null;
let editingGradeIndex = null;
let editingFeeIndex = null;

// Local storage key
const STORAGE_KEY = 'glory_regin_sms_v1';

// ========================================
// Authentication Functions
// ========================================

document.getElementById('loginForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const userRole = document.getElementById('userRole').value;
    const idInput = document.getElementById('idInput').value;
    const rememberMe = document.getElementById('rememberMe').checked;
    
    // Basic validation
    if (!userRole) {
        showToast('Please select a user role', 'error');
        return;
    }

    // Parent login: verify student ID instead of password
    if (userRole === 'parent') {
        if (!idInput) {
            showToast('Please enter student ID', 'error');
            return;
        }
        const student = students.find(s => s.id === idInput.trim().toUpperCase());
        if (!student) {
            showToast('Invalid Student ID', 'error');
            return;
        }
        // Parent login successful
        currentUser = {
            email: email || `parent_${student.id}@school.local`,
            role: userRole,
            name: email.split('@')[0] || 'Parent',
            studentId: student.id,
            studentName: student.name
        };
        
        if (rememberMe) {
            localStorage.setItem('userEmail', currentUser.email);
            localStorage.setItem('userRole', userRole);
            localStorage.setItem('currentUser', JSON.stringify(currentUser));
        }
        
        showDashboard();
        showToast(`Welcome, parent of ${student.name}!`, 'success');
    } else if (userRole === 'teacher') {
        if (!idInput) {
            showToast('Please enter teacher ID', 'error');
            return;
        }
        const teacher = teachers.find(t => t.id === idInput.trim().toUpperCase());
        if (!teacher) {
            showToast('Invalid Teacher ID', 'error');
            return;
        }
        // Teacher login successful
        currentUser = {
            email: teacher.email,
            role: userRole,
            name: teacher.name,
            teacherId: teacher.id
        };
        
        if (rememberMe) {
            localStorage.setItem('userEmail', teacher.email);
            localStorage.setItem('userRole', userRole);
            localStorage.setItem('currentUser', JSON.stringify(currentUser));
        }
        
        showDashboard();
        showToast(`Welcome, ${teacher.name}!`, 'success');
    } else if (userRole === 'student') {
        if (!idInput) {
            showToast('Please enter student ID', 'error');
            return;
        }
        const student = students.find(s => s.id === idInput.trim().toUpperCase());
        if (!student) {
            showToast('Invalid Student ID', 'error');
            return;
        }
        // Student login successful
        currentUser = {
            email: student.email,
            role: userRole,
            name: student.name,
            studentId: student.id,
            studentClass: student.class
        };
        
        if (rememberMe) {
            localStorage.setItem('userEmail', student.email);
            localStorage.setItem('userRole', userRole);
            localStorage.setItem('currentUser', JSON.stringify(currentUser));
        }
        
        showDashboard();
        showToast(`Welcome, ${student.name}!`, 'success');
    } else if (!email || !password) {
        showToast('Please fill all required fields', 'error');
        return;
    } else if (validateLogin(email, password, userRole)) {
        // Standard login for admin with email and password
        currentUser = {
            email: email,
            role: userRole,
            name: email.split('@')[0]
        };
        
        if (rememberMe) {
            localStorage.setItem('userEmail', email);
            localStorage.setItem('userRole', userRole);
            localStorage.setItem('currentUser', JSON.stringify(currentUser));
        }
        
        showDashboard();
        showToast('Login successful!', 'success');
    } else {
        showToast('Invalid email or password', 'error');
    }
});

// Toggle ID field visibility and label based on role selection
function toggleIdField() {
    const userRole = document.getElementById('userRole').value;
    const idField = document.getElementById('idField');
    const idLabel = document.getElementById('idLabel');
    const idInput = document.getElementById('idInput');
    
    if (userRole === 'parent') {
        idField.style.display = 'block';
        idLabel.textContent = 'Student ID';
        idInput.placeholder = "Enter your ward's student ID (e.g., STU001)";
        idInput.required = true;
    } else if (userRole === 'teacher') {
        idField.style.display = 'block';
        idLabel.textContent = 'Teacher ID';
        idInput.placeholder = 'Enter your teacher ID (e.g., TCH001)';
        idInput.required = true;
    } else if (userRole === 'student') {
        idField.style.display = 'block';
        idLabel.textContent = 'Student ID';
        idInput.placeholder = 'Enter your student ID (e.g., STU001)';
        idInput.required = true;
    } else {
        idField.style.display = 'none';
        idInput.required = false;
        idInput.value = '';
    }
}

function togglePasswordVisibility() {
    const passwordInput = document.getElementById('password');
    const toggleButton = document.querySelector('.password-toggle i');
    
    if (passwordInput.type === 'password') {
        passwordInput.type = 'text';
        toggleButton.classList.remove('fa-eye');
        toggleButton.classList.add('fa-eye-slash');
    } else {
        passwordInput.type = 'password';
        toggleButton.classList.remove('fa-eye-slash');
        toggleButton.classList.add('fa-eye');
    }
}

function validateLogin(email, password, role) {
    // Simple validation - in production, verify with backend
    // Check against users list if present, otherwise basic validation
    if (users && users.length) {
        const u = users.find(x => x.email === email && x.role === role);
        return u && u.password === password;
    }
    return email.includes('@') && password.length >= 6;
}

function logout() {
    currentUser = null;
    localStorage.removeItem('userEmail');
    localStorage.removeItem('userRole');
    localStorage.removeItem('currentUser');
    document.getElementById('loginSection').classList.remove('hidden');
    document.getElementById('mainDashboard').classList.add('hidden');
    document.getElementById('loginForm').reset();
    showToast('Logged out successfully', 'success');
}

function showSignup() {
    const modalBody = document.getElementById('modalBody');
    modalBody.innerHTML = `
        <h3>Create Account</h3>
        <form id="signupForm" onsubmit="saveSignup(event)">
            <div class="form-group">
                <label for="signupName">Full Name</label>
                <input type="text" id="signupName" required>
            </div>
            <div class="form-group">
                <label for="signupEmail">Email</label>
                <input type="email" id="signupEmail" required>
            </div>
            <div class="form-group">
                <label for="signupPassword">Password</label>
                <input type="password" id="signupPassword" required>
            </div>
            <div class="form-group">
                <label for="signupRole">Role</label>
                <select id="signupRole" required>
                    <option value="teacher">Teacher</option>
                    <option value="student">Student</option>
                    <option value="parent">Parent</option>
                    <option value="admin">Administrator</option>
                </select>
            </div>
            <button type="submit" class="btn btn-primary">Create Account</button>
        </form>
    `;
    openModal();
}

function saveSignup(e) {
    e.preventDefault();
    const name = document.getElementById('signupName').value.trim();
    const email = document.getElementById('signupEmail').value.trim();
    const password = document.getElementById('signupPassword').value;
    const role = document.getElementById('signupRole').value;

    if (!name || !email || !password || !role) {
        showToast('Please fill all signup fields', 'error');
        return;
    }

    if (users.find(u => u.email === email && u.role === role)) {
        showToast('Account already exists for this email and role', 'warning');
        return;
    }

    const user = { id: 'USR' + String(users.length + 1).padStart(3, '0'), name, email, password, role };
    users.push(user);
    saveState();
    closeModal();
    showToast('Account created successfully. Please login.', 'success');
}

// ========================================
// Dashboard & Navigation Functions
// ========================================

function showDashboard() {
    document.getElementById('loginSection').classList.add('hidden');
    document.getElementById('mainDashboard').classList.remove('hidden');
    updateUserGreeting();
    loadDashboardData();
    applyRoleUI(currentUser && currentUser.role);
    showSection('dashboard');
}

function updateUserGreeting() {
    const greeting = document.getElementById('userGreeting');
    if (currentUser) {
        greeting.textContent = `Welcome, ${currentUser.name.charAt(0).toUpperCase() + currentUser.name.slice(1)}`;
    }
}

function showSection(sectionId) {
    // Hide all sections
    document.querySelectorAll('.content-section').forEach(section => {
        section.classList.remove('active');
    });
    
    // Remove active class from all menu items (sidebar)
    document.querySelectorAll('.menu-item').forEach(item => {
        item.classList.remove('active');
    });
    
    // Remove active class from all navbar items
    document.querySelectorAll('.navbar-nav a').forEach(item => {
        item.classList.remove('active');
    });
    
    // Show selected section
    const section = document.getElementById(sectionId);
    if (section) {
        section.classList.add('active');
    }
    
    // Mark sidebar menu item as active
    const activeMenuItem = document.querySelector(`a[onclick="showSection('${sectionId}')"]`);
    if (activeMenuItem) {
        activeMenuItem.classList.add('active');
        if (activeMenuItem.parentElement) {
            activeMenuItem.parentElement.classList.add('active');
        }
    }
    
    // Also mark navbar item as active
    const navbarItems = document.querySelectorAll(`.navbar-nav a[onclick="showSection('${sectionId}')"]`);
    navbarItems.forEach(item => {
        item.classList.add('active');
    });
    
    // Load data based on section
    if (sectionId === 'students') {
        loadStudents();
    } else if (sectionId === 'teachers') {
        loadTeachers();
    } else if (sectionId === 'attendance') {
        loadAttendance();
    } else if (sectionId === 'grades') {
        loadGrades();
    } else if (sectionId === 'fees') {
        loadFees();
    } else if (sectionId === 'notices') {
        loadNotices();
    }
    // Close mobile sidebar if open (keeps desktop sidebar intact)
    closeMobileSidebar();
}

// ========================================
// Dashboard Data Loading
// ========================================

function loadDashboardData() {
    // Load sample data
    document.getElementById('totalStudents').textContent = students.length || '0';
    document.getElementById('totalTeachers').textContent = teachers.length || '0';
    const totalFees = fees.reduce((s, f) => s + (f.amountPaid || 0), 0);
    document.getElementById('feesCollected').textContent = `₵${totalFees.toLocaleString()}`;
    const presentCount = attendance.filter(a => a.status === 'Present').length;
    const attendanceRate = attendance.length ? Math.round((presentCount / attendance.length) * 100) : 0;
    document.getElementById('attendanceRate').textContent = `${attendanceRate}%`;
}

// ========================================
// Student Management Functions
// ========================================

function loadStudents() {
    if (!students || students.length === 0) {
        // Seed sample students if none present
        students = [
            { id: 'STU001', name: 'Adepa Nora', class: 'JHS 1', email: 'adepa@gmail.com', status: 'Active' },
            { id: 'STU002', name: 'Nyarko Smith', class: 'JHS 2', email: 'smith@gmail.com', status: 'Active' },
            { id: 'STU003', name: 'Owusu Johnson', class: 'JHS 1', email: 'owusu@gmail.com', status: 'Active' },
            { id: 'STU004', name: 'Yeboah Sarah', class: 'JHS 3', email: 'sarah@gmail.com', status: 'Inactive' }
        ];
        saveState();
    }

    displayStudents(students);
    updateStudentSelects();
}

// Update any student select inputs on the page so new students appear immediately
function updateStudentSelects() {
    // Populate all selects that should list students. Use a shared class for robustness.
    const els = document.querySelectorAll('select.student-select');
    els.forEach(el => {
        const current = el.value;
        el.innerHTML = `<option value="">Select Student</option>` + students.map(s => `<option value="${s.id}" data-class="${s.class}">${s.name} (${s.class})</option>`).join('');
        if (current) {
            // support migrating old selections stored as name -> find id
            const match = students.find(s => s.id === current || s.name === current);
            if (match) el.value = match.id;
            else el.value = current;
        }
    });
}

function displayStudents(studentList) {
    const tbody = document.getElementById('studentsTableBody');
    
    if (studentList.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" class="text-center">No students found</td></tr>';
        return;
    }
    
    // Add data-label attributes for responsive stacked-card layout on small screens
    tbody.innerHTML = studentList.map(student => `
        <tr>
            <td data-label="Student ID">${student.id}</td>
            <td data-label="Name">${student.name}</td>
            <td data-label="Class">${student.class}</td>
            <td data-label="Email">${student.email}</td>
            <td data-label="Status"><span class="badge ${student.status.toLowerCase()}" onclick="toggleStudentStatus('${student.id}')" title="Click to toggle status">${student.status}</span></td>
            <td data-label="Actions">
                <button class="btn btn-small btn-primary" onclick="editStudent('${student.id}')">Edit</button>
                <button class="btn btn-small btn-danger" onclick="deleteStudent('${student.id}')">Delete</button>
            </td>
        </tr>
    `).join('');
}

function showStudentForm() {
    const modalBody = document.getElementById('modalBody');
    modalBody.innerHTML = `
        <h3>${editingStudentId ? 'Edit Student' : 'Add New Student'}</h3>
        <form id="studentForm" onsubmit="saveStudent(event)">
            <div class="form-group">
                <label for="studentName">Full Name</label>
                <input type="text" id="studentName" required>
            </div>
            <div class="form-group">
                <label for="studentEmail">Email</label>
                <input type="email" id="studentEmail" required>
            </div>
            <div class="form-group">
                <label for="studentClass">Class</label>
                <select id="studentClass" required>
                    <option value="">All Classes</option>
                    <option value="Nursery">Nuserary</option>
                    <option value="KG1">KG 1</option>
                    <option value="KG2">KG 2</option>
                    <option value="Class1">Class 1</option>
                    <option value="Class2">Class 2</option>
                    <option value="Class3">Class 3</option>
                    <option value="Class4">Class 4</option>
                    <option value="Class5">Class 5</option>
                    <option value="Class6">Class 6</option>
                    <option value="JHS1">JHS 1</option>
                    <option value="JHS2">JHS 2</option>
                    <option value="JHS3">JHS 3</option>
                </select>
            </div>
            <div class="form-group">
                <label for="studentPhone">Phone Number</label>
                <input type="tel" id="studentPhone">
            </div>
            <div class="form-group">
                <label for="studentAddress">Address</label>
                <textarea id="studentAddress"></textarea>
            </div>
            <button type="submit" class="btn btn-primary">${editingStudentId ? 'Update Student' : 'Save Student'}</button>
        </form>
    `;
    openModal();

    // If editing, populate form
    if (editingStudentId) {
        const student = students.find(s => s.id === editingStudentId);
        if (student) {
            setTimeout(() => {
                document.getElementById('studentName').value = student.name || '';
                document.getElementById('studentEmail').value = student.email || '';
                document.getElementById('studentClass').value = student.class || '';
                document.getElementById('studentPhone').value = student.phone || '';
                document.getElementById('studentAddress').value = student.address || '';
            }, 50);
        }
    }
}

function saveStudent(event) {
    event.preventDefault();
    const name = document.getElementById('studentName').value.trim();
    const email = document.getElementById('studentEmail').value.trim();
    const studentClass = document.getElementById('studentClass').value;
    const phone = document.getElementById('studentPhone').value.trim();
    const address = document.getElementById('studentAddress').value.trim();

    if (editingStudentId) {
        // Update existing
        const student = students.find(s => s.id === editingStudentId);
        if (student) {
            const oldName = student.name;
            student.name = name;
            student.email = email;
            student.class = studentClass;
            student.phone = phone;
            student.address = address;
            saveState();
            
            // Update all references in attendance, grades, and fees if name changed
            if (oldName !== name) {
                attendance.forEach(att => {
                    if (att.student === oldName) att.student = name;
                });
                grades.forEach(g => {
                    if (g.student === oldName) g.student = name;
                });
                fees.forEach(f => {
                    if (f.student === oldName) f.student = name;
                });
                saveState();
            }
            
            showToast('Student updated successfully', 'success');
            // notify listeners about update
            document.dispatchEvent(new CustomEvent('studentsUpdated', { detail: { action: 'update', student } }));
        }
        editingStudentId = null;
    } else {
        const newStudent = {
            id: 'STU' + String(students.length + 1).padStart(3, '0'),
            name: name,
            class: studentClass,
            email: email,
            phone: phone,
            address: address,
            status: 'Active'
        };
        students.push(newStudent);
        saveState();
        showToast('Student added successfully', 'success');
        // notify listeners about addition so open selects update immediately
        document.dispatchEvent(new CustomEvent('studentsUpdated', { detail: { action: 'add', student: newStudent } }));
    }

    closeModal();
    loadStudents();
    loadDashboardData();
}

function editStudent(id) {
    editingStudentId = id;
    showStudentForm();
}

function deleteStudent(id) {
    showConfirm('Are you sure you want to delete this student? All associated records (attendance, grades, fees) will also be removed.', function(confirmed) {
        if (!confirmed) return;
        const removed = students.find(s => s.id === id);
        const removedName = removed ? removed.name : '';
        
        // Remove from students array
        students = students.filter(s => s.id !== id);
        
        // Also remove all related records to maintain data integrity
        attendance = attendance.filter(att => att.student !== removedName);
        grades = grades.filter(g => g.student !== removedName);
        fees = fees.filter(f => f.student !== removedName);
        
        saveState();
        showToast('Student and all related records deleted successfully', 'success');
        // notify listeners so open selects and UI update immediately
        document.dispatchEvent(new CustomEvent('studentsUpdated', { detail: { action: 'delete', student: removed } }));
        loadStudents();
        loadDashboardData();
    });
}

function toggleStudentStatus(id) {
    const student = students.find(s => s.id === id);
    if (student) {
        student.status = student.status === 'Active' ? 'Inactive' : 'Active';
        saveState();
        showToast(`${student.name} is now ${student.status}`, 'success');
        loadStudents();
    }
}

// Search students
document.addEventListener('DOMContentLoaded', function() {
    if (document.getElementById('searchStudents')) {
        document.getElementById('searchStudents').addEventListener('input', function(e) {
            const searchTerm = e.target.value.toLowerCase();
            const filteredStudents = students.filter(student => 
                student.name.toLowerCase().includes(searchTerm) ||
                student.id.toLowerCase().includes(searchTerm)
            );
            displayStudents(filteredStudents);
        });
    }
});

// ========================================
// Attendance Functions
// ========================================

function loadAttendance() {
    if (!attendance || attendance.length === 0) {
        attendance = [
            {student: 'Adepa Nora', class: 'JHS 1', date: '2025-12-03', status: 'Present' },
            { student: 'Nyarko Smith', class: 'JHS 2', date: '2025-12-03', status: 'Present' },
            { student: 'Owusu Johnson', class: 'JHS 1', date: '2025-12-03', status: 'Absent' },
            { student: 'Yeboah Sarah', class: 'JHS 3', date: '2025-12-03', status: 'Present' }
            ];
        saveState();
    }
    displayAttendance(attendance);
}

function displayAttendance(attendanceList) {
    const tbody = document.getElementById('attendanceTableBody');
    
    if (attendanceList.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" class="text-center">No attendance records found</td></tr>';
        return;
    }
    
    tbody.innerHTML = attendanceList.map((att) => {
        // Find the actual index in the original attendance array
        const actualIndex = attendance.findIndex(a => a.student === att.student && a.class === att.class && a.date === att.date && a.status === att.status);
        return `
        <tr>
            <td>${att.student}</td>
            <td>${att.class}</td>
            <td>${att.date}</td>
            <td><span class="badge ${att.status.toLowerCase()}">${att.status}</span></td>
            <td>
                <button class="btn btn-small btn-primary" onclick="editAttendance(${actualIndex})">Edit</button>
                <button class="btn btn-small btn-danger" onclick="deleteAttendance(${actualIndex})">Delete</button>
            </td>
        </tr>
    `;
    }).join('');
}

function filterAttendance() {
    const dateFilter = document.getElementById('attendanceDate').value;
    const classFilter = document.getElementById('classFilter').value;
    const statusFilter = document.getElementById('attendanceStatusFilter').value;
    
    const filtered = attendance.filter(att => {
        const dateMatch = !dateFilter || att.date === dateFilter;
        const classMatch = !classFilter || att.class === classFilter;
        const statusMatch = !statusFilter || att.status === statusFilter;
        return dateMatch && classMatch && statusMatch;
    });
    
    displayAttendance(filtered);
}

function showAttendanceForm() {
    const modalBody = document.getElementById('modalBody');
    modalBody.innerHTML = `
        <h3>Record Attendance</h3>
        <form id="attendanceForm" onsubmit="saveAttendance(event)">
            <div class="form-group">
                <label for="attendanceClass">Class</label>
                <select id="attendanceClass" required>
                    <option value="">All Classes</option>
                    <option value="Nursery">Nuserary</option>
                    <option value="KG1">KG 1</option>
                    <option value="KG2">KG 2</option>
                    <option value="Class1">Class 1</option>
                    <option value="Class2">Class 2</option>
                    <option value="Class3">Class 3</option>
                    <option value="Class4">Class 4</option>
                    <option value="Class5">Class 5</option>
                    <option value="Class6">Class 6</option>
                    <option value="JHS1">JHS 1</option>
                    <option value="JHS2">JHS 2</option>
                    <option value="JHS3">JHS 3</option>   
                </select>
            </div>
            <div class="form-group">
                <label for="attendanceStudentSelect">Student</label>
                <select id="attendanceStudentSelect" class="student-select" required>
                    <option value="">Select Student</option>
                    ${students.map(s => `<option value="${s.id}" data-class="${s.class}">${s.name} (${s.class})</option>`).join('')}
                </select>
            </div>
            <div class="form-group">
                <label for="attendanceDate2">Date</label>
                <input type="date" id="attendanceDate2" required>
            </div>
            <div class="form-group">
                <label for="attendanceStatus">Status</label>
                <select id="attendanceStatus" required>
                    <option value="Present">Present</option>
                    <option value="Absent">Absent</option>
                    <option value="Late">Late</option>
                    <option value="Sick">Sick Leave</option>
                </select>
            </div>
            <button type="submit" class="btn btn-primary">Save Attendance</button>
        </form>
    `;
    openModal();

    // After modal renders, filter students by selected class and wire class->student filtering
    setTimeout(() => {
        const classSelect = document.getElementById('attendanceClass');
        const studentSelect = document.getElementById('attendanceStudentSelect');
        if (!classSelect || !studentSelect) return;

        // populate students for the currently selected class (if any)
        function populateForClass(cls) {
            const opts = students.filter(s => !cls || s.class === cls).map(s => `<option value="${s.id}" data-class="${s.class}">${s.name} (${s.class})</option>`).join('');
            const prev = studentSelect.value;
            studentSelect.innerHTML = `<option value="">Select Student</option>` + opts;
            // try to re-select previous selection if still present (match by id or name)
            if (prev) {
                const match = students.find(s => s.id === prev || s.name === prev);
                if (match) studentSelect.value = match.id;
            }
        }

        // initial state: student select disabled until a class is chosen
        studentSelect.innerHTML = `<option value="">Select class first</option>`;
        studentSelect.disabled = true;

        classSelect.addEventListener('change', function() {
            const cls = this.value;
            if (!cls) {
                studentSelect.innerHTML = `<option value="">Select class first</option>`;
                studentSelect.disabled = true;
            } else {
                populateForClass(cls);
                studentSelect.disabled = false;
            }
        });
    }, 20);
}

function saveAttendance(event) {
    event.preventDefault();
    const studentId = document.getElementById('attendanceStudentSelect').value;
    const studentObj = students.find(s => s.id === studentId);
    const student = studentObj ? studentObj.name : studentId;
    const attendanceClass = studentObj ? studentObj.class : document.getElementById('attendanceClass').value;
    const date = document.getElementById('attendanceDate2').value;
    const status = document.getElementById('attendanceStatus').value;
    if (editingAttendanceIndex !== null) {
        attendance[editingAttendanceIndex] = { student, class: attendanceClass, date, status };
        editingAttendanceIndex = null;
        showToast('Attendance updated', 'success');
    } else {
        attendance.push({ student, class: attendanceClass, date, status });
        showToast('Attendance recorded successfully', 'success');
    }
    saveState();
    closeModal();
    loadAttendance();
}

function editAttendance(index) {
    editingAttendanceIndex = index;
    const att = attendance[index];
    const modalBody = document.getElementById('modalBody');
    // Build student select filtered to the attendance record's class to avoid mis-allocation
    // Try to find the student id from the stored name (backwards compatible)
    const matchedStudent = students.find(s => s.name === att.student || s.id === att.student);
    const studentIdVal = matchedStudent ? matchedStudent.id : '';
    const cls = att.class || (matchedStudent ? matchedStudent.class : '');

    modalBody.innerHTML = `
        <h3>Edit Attendance</h3>
        <form id="attendanceEditForm" onsubmit="saveAttendance(event)">
            <div class="form-group">
                <label for="attendanceClass">Class</label>
                <input type="text" id="attendanceClass" value="${cls}" readonly>
            </div>
            <div class="form-group">
                <label for="attendanceStudentSelect">Student</label>
                <select id="attendanceStudentSelect" class="student-select" required>
                    <option value="">Select Student</option>
                    ${students.filter(s => s.class === cls).map(s => `<option value="${s.id}" ${s.id === studentIdVal ? 'selected' : ''} data-class="${s.class}">${s.name} (${s.class})</option>`).join('')}
                </select>
            </div>
            <div class="form-group">
                <label for="attendanceDate2">Date</label>
                <input type="date" id="attendanceDate2" value="${att.date}" required>
            </div>
            <div class="form-group">
                <label for="attendanceStatus">Status</label>
                <select id="attendanceStatus" required>
                    <option value="Present">Present</option>
                    <option value="Absent">Absent</option>
                    <option value="Late">Late</option>
                    <option value="Sick">Sick Leave</option>
                </select>
            </div>
            <button type="submit" class="btn btn-primary">Update Attendance</button>
        </form>
    `;
    openModal();
    // set status value
    setTimeout(() => {
        document.getElementById('attendanceStatus').value = att.status;
        // ensure the student select is present and set (already selected in the template), if not try to set
        const sSel = document.getElementById('attendanceStudentSelect');
        if (sSel && !sSel.value && studentIdVal) sSel.value = studentIdVal;
    }, 20);
}

function deleteAttendance(index) {
    showConfirm('Are you sure you want to delete this attendance record?', function(confirmed) {
        if (!confirmed) return;
        attendance.splice(index, 1);
        saveState();
        showToast('Attendance record deleted successfully', 'success');
        loadAttendance();
    });
}

// ========================================
// Grades Functions
// ========================================

function loadGrades() {
    if (!grades || grades.length === 0) {
        grades = [
            { student: 'Adepa Nora', subject: 'Mathematics', classTest: 15, assignment: 8, exam: 72, total: 95 },
            { student: 'Nyarko Smith', subject: 'English', classTest: 18, assignment: 9, exam: 85, total: 112 },
            { student: 'Owusu Johnson', subject: 'Science', classTest: 14, assignment: 7, exam: 68, total: 89 },
            { student: 'Yeboah Sarah', subject: 'History', classTest: 17, assignment: 9, exam: 79, total: 105 }
        ];
        saveState();
    }
    displayGrades(grades);
}

function displayGrades(gradesList) {
    const tbody = document.getElementById('gradesTableBody');
    
    if (gradesList.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" class="text-center">No grades found</td></tr>';
        return;
    }
    
    tbody.innerHTML = gradesList.map((grade) => {
        // Find the actual index in the original grades array
        const actualIndex = grades.findIndex(g => g.student === grade.student && g.subject === grade.subject);
        return `
        <tr>
            <td>${grade.student}</td>
            <td>${grade.subject}</td>
            <td>${grade.classTest}</td>
            <td>${grade.assignment}</td>
            <td>${grade.exam}</td>
            <td>${grade.total}</td>
            <td>
                <button class="btn btn-small btn-primary" onclick="editGrade(${actualIndex})">Edit</button>
                <button class="btn btn-small btn-danger" onclick="deleteGrade(${actualIndex})">Delete</button>
            </td>
        </tr>
    `;
    }).join('');
}

function filterGrades() {
    const classFilter = document.getElementById('classGradeFilter').value;
    const subjectFilter = document.getElementById('subjectFilter').value;
    
    const filtered = grades.filter(grade => {
        // Get the student's class
        const student = students.find(s => s.name === grade.student);
        const studentClass = student ? student.class : '';
        
        const classMatch = !classFilter || studentClass === classFilter;
        const subjectMatch = !subjectFilter || grade.subject === subjectFilter;
        return classMatch && subjectMatch;
    });
    
    displayGrades(filtered);
}

function showGradeForm() {
    const modalBody = document.getElementById('modalBody');
    modalBody.innerHTML = `
        <h3>Enter Grades</h3>
        <form id="gradeForm" onsubmit="saveGrade(event)">
            <div class="form-group">
                <label for="gradeStudent">Student</label>
                <select id="gradeStudent" class="student-select" required>
                    <option value="">Select Student</option>
                    ${students.map(s => `<option value="${s.id}" data-class="${s.class}">${s.name} (${s.class})</option>`).join('')}
                </select>
            </div>
            <div class="form-group">
                <label for="gradeSubject">Subject</label>
                <select id="gradeSubject" required>
                    <option value="Mathematics">Mathematics</option>
                    <option value="English">English</option>
                    <option value="Science">Science</option>
                    <option value="History">History</option>
                </select>
            </div>
            <div class="form-group">
                <label for="classTest">Class Test (out of 20)</label>
                <input type="number" id="classTest" min="0" max="20" required>
            </div>
            <div class="form-group">
                <label for="assignment">Assignment (out of 10)</label>
                <input type="number" id="assignment" min="0" max="10" required>
            </div>
            <div class="form-group">
                <label for="exam">Exam (out of 100)</label>
                <input type="number" id="exam" min="0" max="100" required>
            </div>
            <button type="submit" class="btn btn-primary">Save Grades</button>
        </form>
    `;
    openModal();
}

function saveGrade(event) {
    event.preventDefault();
    const studentId = document.getElementById('gradeStudent').value;
    const studentObj = students.find(s => s.id === studentId);
    const student = studentObj ? studentObj.name : studentId;
    const subject = document.getElementById('gradeSubject').value;
    const classTest = parseInt(document.getElementById('classTest').value);
    const assignment = parseInt(document.getElementById('assignment').value);
    const exam = parseInt(document.getElementById('exam').value);
    const total = classTest + assignment + exam;
    if (editingGradeIndex !== null) {
        grades[editingGradeIndex] = { student, subject, classTest, assignment, exam, total };
        editingGradeIndex = null;
        showToast('Grades updated successfully', 'success');
    } else {
        grades.push({ student, subject, classTest, assignment, exam, total });
        showToast('Grades saved successfully', 'success');
    }
    saveState();
    closeModal();
    loadGrades();
}

function editGrade(index) {
    editingGradeIndex = index;
    const g = grades[index];
    const modalBody = document.getElementById('modalBody');
    // Find the student ID from the stored name (backwards compatible)
    const matchedStudent = students.find(s => s.name === g.student || s.id === g.student);
    const studentIdVal = matchedStudent ? matchedStudent.id : '';
    modalBody.innerHTML = `
        <h3>Edit Grades</h3>
        <form id="gradeEditForm" onsubmit="saveGrade(event)">
            <div class="form-group">
                <label for="gradeStudent">Student</label>
                <select id="gradeStudent" class="student-select" required>
                    <option value="">Select Student</option>
                    ${students.map(s => `<option value="${s.id}" ${s.id === studentIdVal ? 'selected' : ''} data-class="${s.class}">${s.name} (${s.class})</option>`).join('')}
                </select>
            </div>
            <div class="form-group">
                <label for="gradeSubject">Subject</label>
                <select id="gradeSubject" required>
                    <option value="Mathematics" ${g.subject === 'Mathematics' ? 'selected' : ''}>Mathematics</option>
                    <option value="English" ${g.subject === 'English' ? 'selected' : ''}>English</option>
                    <option value="Science" ${g.subject === 'Science' ? 'selected' : ''}>Science</option>
                    <option value="History" ${g.subject === 'History' ? 'selected' : ''}>History</option>
                </select>
            </div>
            <div class="form-group">
                <label for="classTest">Class Test (out of 20)</label>
                <input type="number" id="classTest" min="0" max="20" value="${g.classTest}" required>
            </div>
            <div class="form-group">
                <label for="assignment">Assignment (out of 10)</label>
                <input type="number" id="assignment" min="0" max="10" value="${g.assignment}" required>
            </div>
            <div class="form-group">
                <label for="exam">Exam (out of 100)</label>
                <input type="number" id="exam" min="0" max="100" value="${g.exam}" required>
            </div>
            <button type="submit" class="btn btn-primary">Update Grades</button>
        </form>
    `;
    openModal();
    setTimeout(() => {
        if (document.getElementById('gradeStudent')) {
            document.getElementById('gradeStudent').value = studentIdVal;
        }
    }, 20);
}

function deleteGrade(index) {
    showConfirm('Are you sure you want to delete this grade record?', function(confirmed) {
        if (!confirmed) return;
        grades.splice(index, 1);
        saveState();
        showToast('Grade record deleted successfully', 'success');
        loadGrades();
    });
}

// ========================================
// Fee Management Functions
// ========================================

function loadFees() {
    if (!fees || fees.length === 0) {
        fees = [
            { student: 'Adepa Nora', amountDue: 500, amountPaid: 500, balance: 0, status: 'Paid', dueDate: '2025-12-31' },
            { student: 'Nyarko Smith', amountDue: 500, amountPaid: 300, balance: 200, status: 'Partial', dueDate: '2025-12-31' },
            { student: 'Owusu Johnson', amountDue: 500, amountPaid: 0, balance: 500, status: 'Pending', dueDate: '2025-12-31' },
            { student: 'Yeboah Sarah', amountDue: 500, amountPaid: 500, balance: 0, status: 'Paid', dueDate: '2025-12-31' }
        ];
        saveState();
    }
    displayFees(fees);
}

// Fee Structures & Payment History helpers
function loadFeeStructures() {
    if (!feeStructures || feeStructures.length === 0) {
        feeStructures = [
            { id: 'FS001', name: 'Tuition - JHS 1', class: 'JHS 1', amount: 500, currency: 'GHS' },
            { id: 'FS002', name: 'Tuition - JHS 2', class: 'JHS 2', amount: 600, currency: 'GHS' },
            { id: 'FS003', name: 'Tuition - JHS 3', class: 'JHS 3', amount: 700, currency: 'GHS' }
        ];
        saveState();
    }
    // ensure any open selects are updated
    updateFeeStructureSelects();
}

function loadPaymentHistory() {
    if (!paymentHistory) paymentHistory = [];
}

function displayFees(feesList) {
    const tbody = document.getElementById('feesTableBody');
    
    if (feesList.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" class="text-center">No fee records found</td></tr>';
        return;
    }
    
    tbody.innerHTML = feesList.map((fee) => {
        // Find the actual index in the original fees array
        const actualIndex = fees.findIndex(f => f.student === fee.student && f.amountDue === fee.amountDue && f.dueDate === fee.dueDate);
        return `
        <tr>
            <td data-label="Student">${fee.student}</td>
            <td data-label="Amount Due">${formatCurrency(fee.amountDue, fee.currency)}</td>
            <td data-label="Amount Paid">${formatCurrency(fee.amountPaid, fee.currency)}</td>
            <td data-label="Balance">${formatCurrency(fee.balance, fee.currency)}</td>
            <td data-label="Status"><span class="badge ${fee.status.toLowerCase()}">${fee.status}</span></td>
            <td data-label="Due Date">${fee.dueDate}</td>
            <td data-label="Action">
                <button class="btn btn-small btn-primary" onclick="editFee(${actualIndex})">Pay</button>
                <button class="btn btn-small btn-secondary" onclick="downloadReceipt(${actualIndex})">Receipt</button>
                <button class="btn btn-small btn-secondary" onclick="showInvoiceDetails(${actualIndex})">Details</button>
                <button class="btn btn-small btn-danger" onclick="deleteFee(${actualIndex})">Delete</button>
            </td>
        </tr>
    `;
    }).join('');
}

function filterFees() {
    const classFilter = document.getElementById('classFeeFilter').value;
    const statusFilter = document.getElementById('feeStatusFilter').value;
    
    const filtered = fees.filter(fee => {
        // Get the student's class
        const student = students.find(s => s.name === fee.student);
        const studentClass = student ? student.class : '';
        
        const classMatch = !classFilter || studentClass === classFilter;
        const statusMatch = !statusFilter || fee.status === statusFilter;
        return classMatch && statusMatch;
    });
    
    displayFees(filtered);
}

function formatCurrency(amount, currency) {
    if (amount == null || amount === '') return '';
    try {
        const cur = currency || 'GHS';
        // Simple mapping for symbol — extend as needed
        const symbol = cur === 'GHS' ? '₵' : cur === 'USD' ? '$' : cur === 'EUR' ? '€' : cur + ' ';
        return `${symbol}${Number(amount).toLocaleString()}`;
    } catch (e) { return amount; }
}

// Show fee structure manager modal
function showFeeStructureManager() {
    loadFeeStructures();
    const modalBody = document.getElementById('modalBody');
    modalBody.innerHTML = `
        <h3>Fee Structures</h3>
        <div style="margin-bottom:0.75rem;"><button class="btn btn-primary" onclick="showAddFeeStructure()">Add Structure</button></div>
        <div id="feeStructuresList"></div>
    `;
    openModal();
    displayFeeStructures();
}

function displayFeeStructures() {
    const el = document.getElementById('feeStructuresList');
    if (!feeStructures || feeStructures.length === 0) {
        el.innerHTML = '<p class="text-center">No fee structures configured</p>';
        return;
    }
    el.innerHTML = `<table class="data-table"><thead><tr><th>ID</th><th>Name</th><th>Class</th><th>Amount</th><th>Currency</th><th>Action</th></tr></thead><tbody>` +
        feeStructures.map((fs, i) => `<tr><td>${fs.id}</td><td>${fs.name}</td><td>${fs.class}</td><td>${formatCurrency(fs.amount, fs.currency)}</td><td>${fs.currency}</td><td><button class="btn btn-small btn-danger" onclick="removeFeeStructure('${fs.id}')">Delete</button></td></tr>`).join('') +
        `</tbody></table>`;
}

function showAddFeeStructure() {
    const modalBody = document.getElementById('modalBody');
    modalBody.innerHTML = `
        <h3>Add Fee Structure</h3>
        <form onsubmit="saveFeeStructure(event)">
            <div class="form-group"><label>Name</label><input id="fsName" required></div>
            <div class="form-group"><label>Class/Stream</label><input id="fsClass" required></div>
            <div class="form-group"><label>Amount (₵)</label><input id="fsAmount" type="number" required></div>
            <div class="form-group"><label>Currency</label><select id="fsCurrency"><option>GHS</option></select></div>
            <button class="btn btn-primary" type="submit">Save</button>
        </form>
    `;
}

function saveFeeStructure(e) {
    e.preventDefault();
    const name = document.getElementById('fsName').value.trim();
    const cls = document.getElementById('fsClass').value.trim();
    const amount = Number(document.getElementById('fsAmount').value);
    const currency = document.getElementById('fsCurrency').value;
    const id = 'FS' + String(feeStructures.length + 1).padStart(3, '0');
    feeStructures.push({ id, name, class: cls, amount, currency });
    saveState();
    showToast('Fee structure saved', 'success');
    displayFeeStructures();
    updateFeeStructureSelects();
}

function removeFeeStructure(id) {
    feeStructures = feeStructures.filter(f => f.id !== id);
    saveState();
    displayFeeStructures();
    updateFeeStructureSelects();
}

function updateFeeStructureSelects() {
    const els = document.querySelectorAll('select.fee-structure-select');
    els.forEach(el => {
        const current = el.value;
        if (!feeStructures || feeStructures.length === 0) {
            el.innerHTML = '<option value="">No structures</option>';
            return;
        }
        el.innerHTML = `<option value="">Select Structure</option>` + feeStructures.map(fs => `<option value="${fs.id}" data-amount="${fs.amount}" data-currency="${fs.currency}">${fs.name} (${fs.class}) - ${fs.currency} ${fs.amount}</option>`).join('');
        if (current) el.value = current;
    });
}

// Show invoice details modal
function showInvoiceDetails(index) {
    const inv = fees[index];
    if (!inv) return showToast('Invoice not found', 'error');
    const modalBody = document.getElementById('modalBody');
    modalBody.innerHTML = `
        <h3>Invoice Details</h3>
        <p><strong>Student:</strong> ${inv.student}</p>
        <p><strong>Amount Due:</strong> ${formatCurrency(inv.amountDue, inv.currency)}</p>
        <p><strong>Amount Paid:</strong> ${formatCurrency(inv.amountPaid, inv.currency)}</p>
        <p><strong>Balance:</strong> ${formatCurrency(inv.balance, inv.currency)}</p>
        <p><strong>Status:</strong> ${inv.status}</p>
        <div style="margin-top:1rem;"><button class="btn btn-primary" onclick="downloadReceipt(${index})">Download Receipt</button></div>
    `;
    openModal();
}

// Download / print receipt for an invoice
function downloadReceipt(index) {
    const inv = fees[index];
    if (!inv) return showToast('Invoice not found', 'error');
    const receiptHtml = `
        <html><head><title>Receipt</title><style>body{font-family:Arial;padding:20px}h2{color:#333}</style>
        <nav>GRPS SMS</nav>
        </head><body>
        <h2>Payment Receipt</h2>
        <p><strong>Invoice ID:</strong> ${inv.id || ('INV' + index)}</p>
        <p><strong>Student:</strong> ${inv.student}</p>
        <p><strong>Amount Paid:</strong> ${formatCurrency(inv.amountPaid, inv.currency)}</p>
        <p><strong>Balance:</strong> ${formatCurrency(inv.balance, inv.currency)}</p>
        <p><strong>Date:</strong> ${new Date().toLocaleString()}</p>
        <hr>
        <p>Glory Regin Preparatory School</p>
        </body></html>
    `;
    const w = window.open('', '_blank');
    w.document.write(receiptHtml);
    w.document.close();
    w.print();
}

// Payment history modal
function showPaymentHistory() {
    loadPaymentHistory();
    const modalBody = document.getElementById('modalBody');
    modalBody.innerHTML = `
        <h3>Payment History</h3>
        <div id="paymentHistoryList"></div>
    `;
    openModal();
    displayPaymentHistory();
}

function displayPaymentHistory() {
    const el = document.getElementById('paymentHistoryList');
    if (!paymentHistory || paymentHistory.length === 0) {
        el.innerHTML = '<p class="text-center">No payment records</p>';
        return;
    }
    el.innerHTML = `<table class="data-table"><thead><tr><th>Date</th><th>Student</th><th>Invoice</th><th>Amount</th><th>Method</th></tr></thead><tbody>` +
        paymentHistory.map(p => `<tr><td>${p.date}</td><td>${p.student}</td><td>${p.invoiceId || ''}</td><td>${formatCurrency(p.amount,p.currency)}</td><td>${p.method}</td></tr>`).join('') +
        `</tbody></table>`;
}

// Send reminders for unpaid fees by creating notices
function sendFeeReminders() {
    const unpaid = fees.filter(f => f.balance > 0);
    if (!unpaid.length) return showToast('No unpaid invoices found', 'info');
    unpaid.forEach(inv => {
        const notice = { id: Date.now() + Math.floor(Math.random()*1000), title: `Fee Reminder: ${inv.student}`, content: `Dear ${inv.student}, you have an outstanding balance of ${formatCurrency(inv.balance, inv.currency)} due on ${inv.dueDate}. Please pay as soon as possible.`, date: new Date().toISOString().split('T')[0] };
        notices.push(notice);
    });
    saveState();
    showToast(`${unpaid.length} reminder(s) created in Notices`, 'success');
}

function showFeeForm() {
    const modalBody = document.getElementById('modalBody');
    // Build fee structure options
    loadFeeStructures();
    const fsOptions = feeStructures.length ? `<option value="">Select Structure</option>` + feeStructures.map(fs => `<option value="${fs.id}" data-amount="${fs.amount}" data-currency="${fs.currency}">${fs.name} (${fs.class}) - ${fs.currency} ${fs.amount}</option>`).join('') : '<option value="">No structures</option>';

    modalBody.innerHTML = `
        <h3>Add Fee Invoice</h3>
        <form id="feeForm" onsubmit="saveFee(event)">
            <div class="form-group">
                <label for="feeStudent">Student</label>
                <select id="feeStudent" class="student-select" required>
                    <option value="">Select Student</option>
                    ${students.map(s => `<option value="${s.id}" data-class="${s.class}">${s.name} (${s.class})</option>`).join('')}
                </select>
            </div>
            <div class="form-group">
                <label for="feeStructure">Fee Structure (optional)</label>
                <select id="feeStructure" class="fee-structure-select">
                    ${fsOptions}
                </select>
            </div>
            <div class="form-group">
                <label for="amountDue">Amount Due</label>
                <input type="number" id="amountDue" required>
            </div>
            <div class="form-group">
                <label for="feeCurrency">Currency</label>
                <select id="feeCurrency"><option>GHS</option></select>
            </div>
            <div class="form-group">
                <label for="feeWaiver">Waiver (₵) - optional</label>
                <input type="number" id="feeWaiver" placeholder="0">
            </div>
            <div class="form-group">
                <label for="feeDueDate">Due Date</label>
                <input type="date" id="feeDueDate" required>
            </div>
            <div class="form-group">
                <label for="feeDescription">Description</label>
                <textarea id="feeDescription" placeholder="e.g., First Term Tuition"></textarea>
            </div>
            <button type="submit" class="btn btn-primary">Create Invoice</button>
        </form>
    `;

    // When a structure is selected, autofill amount and currency
    setTimeout(() => {
        const fsSelect = document.getElementById('feeStructure');
        if (!fsSelect) return;
        fsSelect.addEventListener('change', function() {
            const opt = fsSelect.options[fsSelect.selectedIndex];
            if (!opt) return;
            const amount = opt.getAttribute('data-amount');
            const currency = opt.getAttribute('data-currency');
            if (amount) document.getElementById('amountDue').value = amount;
            if (currency) document.getElementById('feeCurrency').value = currency;
        });
    }, 20);
    openModal();
}

function saveFee(event) {
    event.preventDefault();
    const studentId = document.getElementById('feeStudent').value;
    const studentObj = students.find(s => s.id === studentId);
    const student = studentObj ? studentObj.name : studentId;
    let amountDue = Number(document.getElementById('amountDue').value);
    const currency = document.getElementById('feeCurrency').value || 'GHS';
    const waiver = Number(document.getElementById('feeWaiver').value) || 0;
    const structureId = document.getElementById('feeStructure').value || null;
    const dueDate = document.getElementById('feeDueDate').value;
    const desc = document.getElementById('feeDescription').value || '';

    if (!student || !amountDue || amountDue <= 0) {
        showToast('Please select student and valid amount', 'error');
        return;
    }

    // Apply waiver
    amountDue = Math.max(0, amountDue - (waiver || 0));

    const invoiceId = 'INV' + String(fees.length + 1).padStart(4, '0');
    const invoice = {
        id: invoiceId,
        student: student,
        structureId: structureId,
        amountDue: amountDue,
        amountPaid: 0,
        balance: amountDue,
        status: 'Pending',
        dueDate: dueDate,
        description: desc,
        currency: currency
    };

    fees.push(invoice);
    saveState();
    closeModal();
    showToast('Fee invoice created successfully', 'success');
    loadFees();
}

function showPaymentForm() {
    const modalBody = document.getElementById('modalBody');
    modalBody.innerHTML = `
        <h3>Record Payment</h3>
        <form id="paymentForm" onsubmit="savePayment(event)">
            <div class="form-group">
                <label for="paymentStudent">Student</label>
                <select id="paymentStudent" class="student-select" required>
                    <option value="">Select Student</option>
                    ${students.map(s => `<option value="${s.id}" data-class="${s.class}">${s.name} (${s.class})</option>`).join('')}
                </select>
            </div>
                <div class="form-group">
                <label for="paymentAmount">Amount Paid (₵)</label>
                <input type="number" id="paymentAmount" required>
            </div>
            <div class="form-group">
                <label for="paymentMethod">Payment Method</label>
                <select id="paymentMethod" required>
                    <option value="Bank Transfer">Bank Transfer</option>
                    <option value="Cash">Cash</option>
                    <option value="Card">Card</option>
                    <option value="Online">Online Payment</option>
                </select>
            </div>
            <div class="form-group">
                <label for="paymentDate">Payment Date</label>
                <input type="date" id="paymentDate" required>
            </div>
            <button type="submit" class="btn btn-primary">Record Payment</button>
        </form>
    `;
    openModal();
}

function savePayment(event) {
    event.preventDefault();
    const studentId = document.getElementById('paymentStudent').value;
    const studentObj = students.find(s => s.id === studentId);
    const student = studentObj ? studentObj.name : studentId;
    const amount = parseInt(document.getElementById('paymentAmount').value);
    const method = document.getElementById('paymentMethod').value;
    const date = document.getElementById('paymentDate').value;

    if (!student || !amount || amount <= 0) {
        showToast('Invalid payment details', 'error');
        return;
    }

    let invoice = null;
    if (editingFeeIndex !== null && typeof editingFeeIndex !== 'undefined') {
        invoice = fees[editingFeeIndex];
    } else {
        // Find the earliest invoice with balance for the student
        invoice = fees.find(f => f.student === student && f.balance > 0) || fees.find(f => f.student === student);
    }

    if (!invoice) {
        showToast('No invoice found for selected student', 'error');
        return;
    }

    invoice.amountPaid = (invoice.amountPaid || 0) + amount;
    invoice.balance = Math.max(0, invoice.amountDue - invoice.amountPaid);
    invoice.status = invoice.balance === 0 ? 'Paid' : 'Partial';
    invoice.lastPayment = { amount, method, date };
    editingFeeIndex = null;

    // Record in payment history
    if (!paymentHistory) paymentHistory = [];
    const paymentId = 'PAY' + String(paymentHistory.length + 1).padStart(5, '0');
    paymentHistory.push({ id: paymentId, invoiceId: invoice.id || '', student: invoice.student, amount: amount, method: method, date: date, currency: invoice.currency || 'GHS' });

    saveState();
    showToast('Payment recorded successfully', 'success');
    closeModal();
    loadFees();
}

function editFee(index) {
    editingFeeIndex = index;
    const inv = fees[index];
    const modalBody = document.getElementById('modalBody');
    modalBody.innerHTML = `
        <h3>Record Payment for Invoice</h3>
        <form id="paymentForm" onsubmit="savePayment(event)">
            <div class="form-group">
                <label for="paymentStudent">Student</label>
                <input type="text" id="paymentStudent" value="${inv.student}" readonly>
            </div>
            <div class="form-group">
                <label for="paymentAmount">Amount Paid (₵)</label>
                <input type="number" id="paymentAmount" required value="${inv.balance}">
            </div>
            <div class="form-group">
                <label for="paymentMethod">Payment Method</label>
                <select id="paymentMethod" required>
                    <option value="Bank Transfer">Bank Transfer</option>
                    <option value="Cash">Cash</option>
                    <option value="Card">Card</option>
                    <option value="Online">Online Payment</option>
                </select>
            </div>
            <div class="form-group">
                <label for="paymentDate">Payment Date</label>
                <input type="date" id="paymentDate" required value="${new Date().toISOString().split('T')[0]}">
            </div>
            <div style="display:flex;gap:0.5rem;align-items:center;">
                <button type="submit" class="btn btn-primary">Record Payment</button>
                <button type="button" class="btn btn-success" onclick="simulateOnlinePayment(${index})">Simulate Online Payment</button>
            </div>
        </form>
    `;
    openModal();
}

// Simulate an online payment (placeholder for Stripe/Paystack integration)
function simulateOnlinePayment(index) {
    const inv = fees[index];
    if (!inv) return showToast('Invoice not found', 'error');
    const amount = inv.balance;
    if (!amount || amount <= 0) return showToast('No balance to pay', 'info');

    // In a real integration, redirect to gateway or open checkout here.
    showToast('Simulating online payment...', 'info');
    setTimeout(() => {
        // Mark as paid
        inv.amountPaid = (inv.amountPaid || 0) + amount;
        inv.balance = 0;
        inv.status = 'Paid';
        const paymentId = 'PAY' + String(paymentHistory.length + 1).padStart(5, '0');
        paymentHistory.push({ id: paymentId, invoiceId: inv.id || '', student: inv.student, amount: amount, method: 'Online', date: new Date().toISOString().split('T')[0], currency: inv.currency || 'GHS' });
        saveState();
        showToast('Online payment simulated and recorded', 'success');
        closeModal();
        loadFees();
    }, 1200);
}

function deleteFee(index) {
    showConfirm('Are you sure you want to delete this fee invoice?', function(confirmed) {
        if (!confirmed) return;
        fees.splice(index, 1);
        saveState();
        showToast('Fee invoice deleted successfully', 'success');
        loadFees();
    });
}

// ========================================
// Notices Functions
// ========================================

function loadNotices() {
    if (!notices || notices.length === 0) {
        notices = [
            { id: 1, title: 'School Holiday', content: 'School will be closed on December 25th', date: '2025-12-03' },
            { id: 2, title: 'Final Exam Schedule', content: 'Final exams will commence on December 15th', date: '2025-12-03' },
            { id: 3, title: 'Parent-Teacher Conference', content: 'PTA meeting scheduled for December 10th', date: '2025-12-02' }
        ];
        saveState();
    }
    displayNotices(notices);
}

function displayNotices(noticesList) {
    const container = document.getElementById('noticesContainer');
    
    if (noticesList.length === 0) {
        container.innerHTML = '<p class="text-center">No notices available</p>';
        return;
    }
    
    container.innerHTML = noticesList.map(notice => `
        <div class="notice-card">
            <h4>${notice.title}</h4>
            <p class="notice-date">${new Date(notice.date).toLocaleDateString()}</p>
            <p>${notice.content}</p>
            <div class="mt-2">
                <button class="btn btn-small btn-danger" onclick="deleteNotice(${notice.id})">Delete</button>
            </div>
        </div>
    `).join('');
}

function showNoticeForm() {
    const modalBody = document.getElementById('modalBody');
    modalBody.innerHTML = `
        <h3>Create Notice</h3>
        <form id="noticeForm" onsubmit="saveNotice(event)">
            <div class="form-group">
                <label for="noticeTitle">Title</label>
                <input type="text" id="noticeTitle" required>
            </div>
            <div class="form-group">
                <label for="noticeContent">Content</label>
                <textarea id="noticeContent" required style="height: 150px;"></textarea>
            </div>
            <div class="form-group">
                <label for="noticeTarget">Target Audience</label>
                <select id="noticeTarget" required>
                    <option value="all">All Users</option>
                    <option value="students">Students Only</option>
                    <option value="parents">Parents Only</option>
                    <option value="teachers">Teachers Only</option>
                </select>
            </div>
            <button type="submit" class="btn btn-primary">Create Notice</button>
        </form>
    `;
    openModal();
}

function saveNotice(event) {
    event.preventDefault();
    
    const title = document.getElementById('noticeTitle').value;
    const content = document.getElementById('noticeContent').value;
    const id = Date.now();
    notices.push({ id: id, title: title, content: content, date: new Date().toISOString().split('T')[0] });
    saveState();
    closeModal();
    showToast('Notice created successfully', 'success');
    loadNotices();
}

function deleteNotice(id) {
    showConfirm('Delete this notice?', function(confirmed) {
        if (!confirmed) return;
        notices = notices.filter(n => n.id !== id);
        saveState();
        showToast('Notice deleted', 'success');
        loadNotices();
    });
}

function showSendNotificationForm() {
    const modalBody = document.getElementById('modalBody');
    modalBody.innerHTML = `
        <h3>Send Notification</h3>
        <form id="notificationForm" onsubmit="sendNotification(event)">
            <div class="form-group">
                <label for="notificationRecipient">Send To</label>
                <select id="notificationRecipient" required>
                    <option value="all">All Users</option>
                    <option value="students">All Students</option>
                    <option value="parents">All Parents</option>
                    <option value="teachers">All Teachers</option>
                </select>
            </div>
            <div class="form-group">
                <label for="notificationType">Type</label>
                <select id="notificationType" required>
                    <option value="sms">SMS</option>
                    <option value="email">Email</option>
                    <option value="both">Both SMS & Email</option>
                </select>
            </div>
            <div class="form-group">
                <label for="notificationMessage">Message</label>
                <textarea id="notificationMessage" required style="height: 120px;"></textarea>
            </div>
            <button type="submit" class="btn btn-primary">Send Notification</button>
        </form>
    `;
    openModal();
}

function sendNotification(event) {
    event.preventDefault();
    closeModal();
    showToast('Notification sent successfully', 'success');
}

// ========================================
// Report Functions
// ========================================

function generateReport(reportType) {
    // Build headers and rows for selected report
    let headers = [];
    let rows = [];
    const today = new Date().toISOString().split('T')[0];

    if (reportType === 'student') {
        headers = ['Student ID', 'Name', 'Class', 'Email', 'Phone', 'Status'];
        rows = students.map(s => [s.id || '', s.name || '', s.class || '', s.email || '', s.phone || '', s.status || '']);
    } else if (reportType === 'attendance') {
        headers = ['Student', 'Class', 'Date', 'Status'];
        rows = attendance.map(a => [a.student || '', a.class || '', a.date || '', a.status || '']);
    } else if (reportType === 'grade') {
        headers = ['Student', 'Subject', 'Class Test', 'Assignment', 'Exam', 'Total'];
        rows = grades.map(g => [g.student || '', g.subject || '', g.classTest || 0, g.assignment || 0, g.exam || 0, g.total || 0]);
    } else if (reportType === 'fee') {
        headers = ['Student', 'Amount Due', 'Amount Paid', 'Balance', 'Status', 'Due Date'];
        rows = fees.map(f => [f.student || '', f.amountDue != null ? f.amountDue : '', f.amountPaid != null ? f.amountPaid : '', f.balance != null ? f.balance : '', f.status || '', f.dueDate || '']);
    } else if (reportType === 'fee_arrears') {
        headers = ['Student', 'Amount Due', 'Amount Paid', 'Balance', 'Due Date', 'Days Overdue'];
        const todayDate = new Date();
        rows = fees.filter(f => f.balance > 0).map(f => {
            const due = f.dueDate ? new Date(f.dueDate) : null;
            const days = due ? Math.max(0, Math.floor((todayDate - due) / (1000*60*60*24))) : '';
            return [f.student || '', f.amountDue != null ? f.amountDue : '', f.amountPaid != null ? f.amountPaid : '', f.balance != null ? f.balance : '', f.dueDate || '', days];
        });
    } else {
        showToast('Unknown report type', 'error');
        return;
    }

    const filename = `${reportType}_report_${today}.csv`;

    // Build preview HTML table and show in modal with download option
    const modalBody = document.getElementById('modalBody');
    modalBody.innerHTML = `
        <div style="max-width:1000px;">
            <h3 style="margin-bottom:0.5rem;">${reportType.charAt(0).toUpperCase() + reportType.slice(1)} Report</h3>
            <div style="display:flex;gap:0.5rem;margin-bottom:0.75rem;">
                <button id="downloadReport" class="btn btn-primary">Download CSV</button>
                <button id="copyReport" class="btn btn-secondary">Copy CSV</button>
                <button id="closeReport" class="btn btn-logout">Close</button>
            </div>
            <div style="overflow:auto;max-height:60vh;border-radius:8px;">
                <table class="data-table" id="reportPreviewTable">
                    <thead>
                        <tr>${headers.map(h => `<th>${h}</th>`).join('')}</tr>
                    </thead>
                    <tbody>
                        ${rows.length ? rows.map(r => `<tr>${r.map(c => `<td>${String(c).replace(/</g, '&lt;')}</td>`).join('')}</tr>`).join('') : `<tr><td colspan="${headers.length}" class="text-center">No data available</td></tr>`}
                    </tbody>
                </table>
            </div>
        </div>
    `;

    openModal();

    // Prepare CSV content
    const csvContent = buildCSV(headers, rows);

    // Attach listeners
    document.getElementById('downloadReport').addEventListener('click', function() {
        downloadCSV(filename, csvContent);
    });
    document.getElementById('copyReport').addEventListener('click', function() {
        copyToClipboard(csvContent);
        showToast('CSV copied to clipboard', 'success');
    });
    document.getElementById('closeReport').addEventListener('click', function() {
        closeModal();
    });
}

// Helper: build CSV string from headers and rows
function buildCSV(headers, rows) {
    const esc = v => {
        if (v === null || v === undefined) return '""';
        const s = String(v).replace(/"/g, '""');
        return `"${s}"`;
    };
    const head = headers.map(h => esc(h)).join(',');
    const body = rows.map(r => r.map(esc).join(',')).join('\n');
    return head + (body ? '\n' + body : '');
}

// Helper: trigger CSV download
function downloadCSV(filename, csvContent) {
    try {
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.setAttribute('download', filename);
        document.body.appendChild(a);
        a.click();
        a.remove();
        URL.revokeObjectURL(url);
        showToast('CSV download started', 'success');
    } catch (e) {
        console.error('Failed to download CSV', e);
        showToast('Failed to download CSV', 'error');
    }
}

// Helper: copy text to clipboard (fallback if navigator.clipboard not available)
function copyToClipboard(text) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).catch(() => {
            fallbackCopy(text);
        });
    } else {
        fallbackCopy(text);
    }
}

function fallbackCopy(text) {
    const ta = document.createElement('textarea');
    ta.value = text;
    document.body.appendChild(ta);
    ta.select();
    try { document.execCommand('copy'); } catch (e) { console.error('copy failed', e); }
    ta.remove();
}

// ========================================
// Modal Functions
// ========================================

function openModal() {
    document.getElementById('modalOverlay').classList.remove('hidden');
}

function closeModal() {
    document.getElementById('modalOverlay').classList.add('hidden');
    document.getElementById('modalBody').innerHTML = '';
}

// Custom confirmation dialog (replaces window.confirm)
function showConfirm(message, callback) {
    const modalBody = document.getElementById('modalBody');
    modalBody.innerHTML = `
        <div style="max-width:480px;">
            <h3>Confirm</h3>
            <p style="margin-top:0.5rem;">${message}</p>
            <div style="display:flex;gap:0.75rem;margin-top:1rem;justify-content:flex-end;">
                <button class="btn btn-secondary" id="confirmCancel">Cancel</button>
                <button class="btn btn-danger" id="confirmOk">Confirm</button>
            </div>
        </div>
    `;
    openModal();

    document.getElementById('confirmCancel').onclick = function() {
        closeModal();
        callback(false);
    };
    document.getElementById('confirmOk').onclick = function() {
        closeModal();
        callback(true);
    };
}

// Close modal when clicking outside
document.addEventListener('click', function(e) {
    const modal = document.getElementById('modalOverlay');
    if (e.target === modal) {
        closeModal();
    }
});

// ========================================
// Toast Notification Function
// ========================================

function showToast(message, type = 'info') {
    const container = document.getElementById('toastContainer');
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    
    const icon = {
        success: 'fas fa-check-circle',
        error: 'fas fa-exclamation-circle',
        warning: 'fas fa-exclamation-triangle',
        info: 'fas fa-info-circle'
    };
    
    toast.innerHTML = `
        <i class="${icon[type]}"></i>
        <span>${message}</span>
    `;
    
    container.appendChild(toast);
    
    // Remove toast after 3 seconds
    setTimeout(() => {
        toast.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

// ========================================
// Initialization
// ========================================

document.addEventListener('DOMContentLoaded', function() {
    // Set today's date in attendance form
    const today = new Date().toISOString().split('T')[0];
    const attendanceDateInput = document.getElementById('attendanceDate');
    if (attendanceDateInput) {
        attendanceDateInput.value = today;
    }
    // Load persisted state if available
    const hasState = loadState();
    // If no persisted state, seed base data by calling loaders
    if (!hasState) {
        loadStudents();
        loadAttendance();
        loadGrades();
        loadFees();
        loadNotices();
        loadFeeStructures();
        loadPaymentHistory();
        // Seed a default admin user if none
        if (!users || users.length === 0) {
            users = [{ id: 'USR001', name: 'Administrator', email: 'admin@school.com', password: 'admin123', role: 'admin' }];
            saveState();
        }
    }

    // Restore session if remembered
    restoreSession();

    // Listen for live student updates so open forms/update immediately
    document.addEventListener('studentsUpdated', function(e) {
        // Rebuild student selects everywhere
        updateStudentSelects();
        // Update dashboard counts
        loadDashboardData();
        // If Students section is active, refresh table
        const studentsSection = document.getElementById('students');
        if (studentsSection && studentsSection.classList.contains('active')) {
            displayStudents(students);
        }

        // If a student was added or updated, preselect in empty selects
        try {
            const detail = e && e.detail;
            if (detail && detail.action === 'add' && detail.student) {
                document.querySelectorAll('select.student-select').forEach(s => {
                    if (!s.value) s.value = detail.student.name;
                });
            }

            // If a student was deleted, clear any select that had that value
            if (detail && detail.action === 'delete' && detail.student) {
                const removedName = detail.student.name;
                document.querySelectorAll('select.student-select').forEach(s => {
                    if (s.value === removedName) {
                        s.value = '';
                    }
                });
                // Also, if a payment/fee modal had that student in read-only input, clear it
                document.querySelectorAll('input[id^="paymentStudent"]').forEach(inp => {
                    if (inp.value === removedName) inp.value = '';
                });
            }
        } catch (err) { console.error(err); }
    });

    // Mobile sidebar toggle
    const mobileToggle = document.getElementById('mobileNavToggle');
    const sidebarOverlay = document.getElementById('sidebarOverlay');
    const sidebarEl = document.querySelector('.sidebar');
    if (mobileToggle) {
        mobileToggle.addEventListener('click', function() {
            if (sidebarEl.classList.contains('open')) {
                sidebarEl.classList.remove('open');
                if (sidebarOverlay) sidebarOverlay.classList.add('hidden');
                document.body.classList.remove('no-scroll');
            } else {
                sidebarEl.classList.add('open');
                if (sidebarOverlay) sidebarOverlay.classList.remove('hidden');
                document.body.classList.add('no-scroll');
            }
        });
    }
    if (sidebarOverlay) {
        sidebarOverlay.addEventListener('click', function() {
            if (sidebarEl.classList.contains('open')) {
                sidebarEl.classList.remove('open');
                sidebarOverlay.classList.add('hidden');
                document.body.classList.remove('no-scroll');
            }
        });
    }

    // When a student select changes, auto-fill related class field in the same form (prevents mis-assignment)
    document.addEventListener('change', function(e) {
        if (!e.target) return;
        if (e.target.matches('select.student-select')) {
            const opt = e.target.selectedOptions && e.target.selectedOptions[0];
            const cls = opt ? opt.getAttribute('data-class') : null;
            if (cls) {
                const form = e.target.closest('form');
                if (form) {
                    // look for a class field in the same form (select or input with 'Class' or 'class' in id)
                    const classField = form.querySelector('select[id*="Class"], input[id*="Class"], select[id*="class"], input[id*="class"]');
                    if (classField) classField.value = cls;
                }
            }
        }
    });
});

function closeMobileSidebar() {
    const sidebarEl = document.querySelector('.sidebar');
    const sidebarOverlay = document.getElementById('sidebarOverlay');
    if (!sidebarEl) return;
    // only close if open
    if (sidebarEl.classList.contains('open')) {
        sidebarEl.classList.remove('open');
        if (sidebarOverlay) sidebarOverlay.classList.add('hidden');
        document.body.classList.remove('no-scroll');
    }
}

// ========================================
// Persistence: save & load state to localStorage
// ========================================

function saveState() {
    const state = { students, teachers, attendance, grades, fees, notices, users, feeStructures, paymentHistory };
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (e) {
        console.error('Failed to save state', e);
    }
}

function loadState() {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (!raw) return false;
        const state = JSON.parse(raw);
        students = state.students || [];
        teachers = state.teachers || [];
        attendance = state.attendance || [];
        grades = state.grades || [];
        fees = state.fees || [];
        notices = state.notices || [];
        users = state.users || [];
        feeStructures = state.feeStructures || [];
        paymentHistory = state.paymentHistory || [];
        
        // Validate and sync student names across all modules
        validateStudentNames();
        
        return true;
    } catch (e) {
        console.error('Failed to load state', e);
        return false;
    }
}

// Validate that all student references have correct names matching the student database
function validateStudentNames() {
    // Check attendance records
    attendance.forEach(att => {
        if (att.student) {
            const student = students.find(s => s.name === att.student);
            if (!student) {
                // Name mismatch - try to find by partial match or remove
                console.warn('Attendance: Student name mismatch -', att.student);
            }
        }
    });
    
    // Check grades records
    grades.forEach(g => {
        if (g.student) {
            const student = students.find(s => s.name === g.student);
            if (!student) {
                console.warn('Grades: Student name mismatch -', g.student);
            }
        }
    });
    
    // Check fees records
    fees.forEach(f => {
        if (f.student) {
            const student = students.find(s => s.name === f.student);
            if (!student) {
                console.warn('Fees: Student name mismatch -', f.student);
            }
        }
    });
}

// Restore session (if remember me was used)
function restoreSession() {
    const saved = localStorage.getItem('currentUser');
    if (saved) {
        try {
            currentUser = JSON.parse(saved);
            showDashboard();
        } catch (e) {
            console.error('Failed to parse saved user', e);
        }
    } else {
        const email = localStorage.getItem('userEmail');
        const role = localStorage.getItem('userRole');
        if (email && role) {
            currentUser = { email, role, name: email.split('@')[0] };
            showDashboard();
        }
    }
}

// ========================================
// Teacher Management Functions
// ========================================

function loadTeachers() {
    if (!teachers || teachers.length === 0) {
        // Seed sample teachers if none present
        teachers = [
            { id: 'TCH001', name: 'Mr. Kwame Asante', email: 'kwame@gmail.com', subjects: ['Mathematics'], classes: ['JHS 1'], status: 'Active' },
            { id: 'TCH002', name: 'Mrs. Ama Agyeman', email: 'ama@gmail.com', subjects: ['English'], classes: ['JHS 2'], status: 'Active' },
            { id: 'TCH003', name: 'Mr. Kofi Mensah', email: 'kofi@gmail.com', subjects: ['Science'], classes: ['JHS 1'], status: 'Active' }
        ];
        saveState();
    }

    displayTeachers(teachers);
}

function displayTeachers(teacherList) {
    const tbody = document.getElementById('teachersTableBody');
    
    if (teacherList.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" class="text-center">No teachers found</td></tr>';
        return;
    }
    
    tbody.innerHTML = teacherList.map(teacher => `
        <tr>
            <td data-label="Teacher ID">${teacher.id}</td>
            <td data-label="Name">${teacher.name}</td>
            <td data-label="Email">${teacher.email}</td>
            <td data-label="Subjects">${Array.isArray(teacher.subjects) ? teacher.subjects.join(', ') : teacher.subject || 'N/A'}</td>
            <td data-label="Classes">${Array.isArray(teacher.classes) ? teacher.classes.join(', ') : teacher.class || 'N/A'}</td>
            <td data-label="Status"><span class="badge ${teacher.status.toLowerCase()}" onclick="toggleTeacherStatus('${teacher.id}')" title="Click to toggle status">${teacher.status}</span></td>
            <td data-label="Actions">
                <button class="btn btn-small btn-primary" onclick="editTeacher('${teacher.id}')">Edit</button>
                <button class="btn btn-small btn-danger" onclick="deleteTeacher('${teacher.id}')">Delete</button>
            </td>
        </tr>
    `).join('');
}

function showTeacherForm() {
    const modalBody = document.getElementById('modalBody');
    const editingId = window.editingTeacherId || null;
    
    const subjects = ['Mathematics', 'English', 'Science', 'Social Studies', 'Physical Education', 'Computer Science', 'Art', 'Music', 'History', 'Geography'];
    const classes = ['Nuserary', 'KG1', 'KG2', 'Class1', 'Class2', 'Class3', 'Class4', 'Class5', 'Class6', 'JHS1', 'JHS2', 'JHS3'];
    
    let subjectsHTML = subjects.map(subject => `
        <label style="display: inline-flex; align-items: center; margin-right: 1rem; margin-bottom: 0.5rem; cursor: pointer;">
            <input type="checkbox" id="subject_${subject}" value="${subject}" style="margin-right: 0.5rem; cursor: pointer;">
            ${subject}
        </label>
    `).join('');
    
    let classesHTML = classes.map(cls => `
        <label style="display: inline-flex; align-items: center; margin-right: 1rem; margin-bottom: 0.5rem; cursor: pointer;">
            <input type="checkbox" id="class_${cls}" value="${cls}" style="margin-right: 0.5rem; cursor: pointer;">
            ${cls}
        </label>
    `).join('');
    
    modalBody.innerHTML = `
        <h3>${editingId ? 'Edit Teacher' : 'Add New Teacher'}</h3>
        <form id="teacherForm" onsubmit="saveTeacher(event)">
            <div class="form-group">
                <label for="teacherName">Full Name</label>
                <input type="text" id="teacherName" required>
            </div>
            <div class="form-group">
                <label for="teacherEmail">Email</label>
                <input type="email" id="teacherEmail" required>
            </div>
            <div class="form-group">
                <label>Subjects (check all that apply)</label>
                <div style="border: 1px solid #bdc3c7; padding: 1rem; border-radius: 4px; background-color: #f9f9f9;">
                    ${subjectsHTML}
                </div>
            </div>
            <div class="form-group">
                <label>Classes (check all that apply)</label>
                <div style="border: 1px solid #bdc3c7; padding: 1rem; border-radius: 4px; background-color: #f9f9f9;">
                    ${classesHTML}
                </div>
            </div>
            <button type="submit" class="btn btn-primary">${editingId ? 'Update Teacher' : 'Save Teacher'}</button>
        </form>
    `;
    openModal();

    // If editing, populate form
    if (editingId) {
        const teacher = teachers.find(t => t.id === editingId);
        if (teacher) {
            setTimeout(() => {
                document.getElementById('teacherName').value = teacher.name || '';
                document.getElementById('teacherEmail').value = teacher.email || '';
                
                // Set checked subjects
                const teacherSubjects = Array.isArray(teacher.subjects) ? teacher.subjects : [teacher.subject || ''];
                subjects.forEach(subject => {
                    const checkbox = document.getElementById(`subject_${subject}`);
                    if (checkbox) {
                        checkbox.checked = teacherSubjects.includes(subject);
                    }
                });
                
                // Set checked classes
                const teacherClasses = Array.isArray(teacher.classes) ? teacher.classes : [teacher.class || ''];
                classes.forEach(cls => {
                    const checkbox = document.getElementById(`class_${cls}`);
                    if (checkbox) {
                        checkbox.checked = teacherClasses.includes(cls);
                    }
                });
            }, 50);
        }
    }
}

function saveTeacher(event) {
    event.preventDefault();
    const name = document.getElementById('teacherName').value.trim();
    const email = document.getElementById('teacherEmail').value.trim();
    
    // Get checked subjects
    const subjectCheckboxes = document.querySelectorAll('input[id^="subject_"]:checked');
    const subjects = Array.from(subjectCheckboxes).map(cb => cb.value);
    
    // Get checked classes
    const classCheckboxes = document.querySelectorAll('input[id^="class_"]:checked');
    const classes = Array.from(classCheckboxes).map(cb => cb.value);
    
    const editingId = window.editingTeacherId || null;

    if (!name || !email || subjects.length === 0 || classes.length === 0) {
        showToast('Please fill all teacher fields and select at least one subject and class', 'error');
        return;
    }

    if (editingId) {
        // Update existing teacher
        const teacher = teachers.find(t => t.id === editingId);
        if (teacher) {
            teacher.name = name;
            teacher.email = email;
            teacher.subjects = subjects;
            teacher.classes = classes;
            saveState();
            showToast('Teacher updated successfully', 'success');
        }
        window.editingTeacherId = null;
    } else {
        // Add new teacher
        const newTeacher = {
            id: 'TCH' + String(teachers.length + 1).padStart(3, '0'),
            name: name,
            email: email,
            subjects: subjects,
            classes: classes,
            status: 'Active'
        };
        teachers.push(newTeacher);
        saveState();
        showToast('Teacher added successfully', 'success');
    }

    closeModal();
    loadTeachers();
    loadDashboardData();
}

function editTeacher(id) {
    window.editingTeacherId = id;
    showTeacherForm();
}

function deleteTeacher(id) {
    showConfirm('Are you sure you want to delete this teacher?', function(confirmed) {
        if (!confirmed) return;
        teachers = teachers.filter(t => t.id !== id);
        saveState();
        showToast('Teacher deleted successfully', 'success');
        loadTeachers();
        loadDashboardData();
    });
}

function toggleTeacherStatus(id) {
    const teacher = teachers.find(t => t.id === id);
    if (teacher) {
        teacher.status = teacher.status === 'Active' ? 'Inactive' : 'Active';
        saveState();
        showToast(`${teacher.name} is now ${teacher.status}`, 'success');
        loadTeachers();
    }
}

// Search teachers
document.addEventListener('DOMContentLoaded', function() {
    if (document.getElementById('searchTeachers')) {
        document.getElementById('searchTeachers').addEventListener('input', function(e) {
            const searchTerm = e.target.value.toLowerCase();
            const filteredTeachers = teachers.filter(teacher => {
                const subjects = Array.isArray(teacher.subjects) ? teacher.subjects.join(' ').toLowerCase() : (teacher.subject || '').toLowerCase();
                const classes = Array.isArray(teacher.classes) ? teacher.classes.join(' ').toLowerCase() : (teacher.class || '').toLowerCase();
                return (
                    teacher.name.toLowerCase().includes(searchTerm) ||
                    teacher.id.toLowerCase().includes(searchTerm) ||
                    subjects.includes(searchTerm) ||
                    classes.includes(searchTerm)
                );
            });
            displayTeachers(filteredTeachers);
        });
    }
});

// Apply UI/UX changes based on role
function applyRoleUI(role) {
    // normalize
    if (!role) return;
    role = role.toString().toLowerCase();

    // set body class for color theming
    document.body.classList.remove('role-admin','role-teacher','role-student','role-parent');
    document.body.classList.add('role-' + role);

    // Show/hide elements that declare allowed roles via data-roles
    document.querySelectorAll('[data-roles]').forEach(el => {
        const allowed = el.getAttribute('data-roles').split(',').map(s => s.trim().toLowerCase());
        if (allowed.includes(role)) {
            el.classList.remove('hidden');
            // if it's a menu-item anchor, ensure its parent li is visible
            if (el.classList.contains('menu-item')) el.parentElement.classList.remove('hidden');
        } else {
            el.classList.add('hidden');
            if (el.classList.contains('menu-item')) el.parentElement.classList.add('hidden');
        }
    });

    // If current active section is hidden for this role, switch to dashboard
    const active = document.querySelector('.content-section.active');
    if (active) {
        const id = active.id;
        // find a menu link that points to this id and check visibility
        const link = document.querySelector(`[onclick="showSection('${id}')"]`);
        if (link && (link.classList.contains('hidden') || link.parentElement.classList.contains('hidden'))) {
            showSection('dashboard');
        }
    }

    // Update any student selects immediately
    updateStudentSelects();
}
