// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyD7KYU4LWgHD27GFPo_KrW5fUdt2qbKp1Y",
  authDomain: "catet-pr.firebaseapp.com",
  projectId: "catet-pr",
  storageBucket: "catet-pr.firebasestorage.app",
  messagingSenderId: "961010488423",
  appId: "1:961010488423:web:dc2640b6e4829c6ccf70c2",
  measurementId: "G-5XVGW641LV"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
// Inisialisasi Firebase
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();

// Cek status login (untuk halaman yang memerlukan autentikasi)
auth.onAuthStateChanged(user => {
    if (!user) {
        // Jika tidak login dan bukan di halaman index atau admin, redirect ke login
        const currentPage = window.location.pathname.split('/').pop();
        if (currentPage !== 'index.html' && currentPage !== 'admin.html' && currentPage !== '') {
            window.location.href = 'admin.html';
        }
    } else {
        // Cek role user untuk admin panel
        const currentPage = window.location.pathname.split('/').pop();
        if (currentPage === 'dashboard.html') {
            db.collection('users').doc(user.uid).get()
                .then(doc => {
                    if (!doc.exists || doc.data().role !== 'admin') {
                        alert('Anda tidak memiliki akses admin!');
                        auth.signOut();
                        window.location.href = 'admin.html';
                    } else {
                        // User adalah admin, load data
                        loadAdminHomeworks();
                    }
                });
        }
    }
});

// Login function
function login() {
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const loginError = document.getElementById('login-error');
    
    auth.signInWithEmailAndPassword(email, password)
        .then((userCredential) => {
            // Login berhasil
            window.location.href = 'dashboard.html';
        })
        .catch((error) => {
            // Login gagal
            loginError.classList.remove('d-none');
            console.error("Error login:", error);
        });
}

// Logout function
function logout() {
    auth.signOut().then(() => {
        window.location.href = 'index.html';
    });
}

// Event listener untuk form login
document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', function(e) {
            e.preventDefault();
            login();
        });
    }
});