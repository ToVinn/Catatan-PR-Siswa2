// Inisialisasi Firebase (sama seperti di auth.js)
const firebaseConfig = {
    apiKey: "AIza...",
    authDomain: "catatan-pr-siswa.firebaseapp.com",
    projectId: "catatan-pr-siswa",
    storageBucket: "catatan-pr-siswa.appspot.com",
    messagingSenderId: "...",
    appId: "..."
};

firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

// Page navigation untuk dashboard
function showPage(page) {
    // Hide all pages
    const pages = document.querySelectorAll('.page-section');
    pages.forEach(p => p.classList.remove('active'));
    
    // Show selected page
    document.getElementById(`${page}-page`).classList.add('active');
    
    // Update sidebar active link
    if (page === 'dashboard' || page === 'add-pr' || page === 'edit-pr') {
        const sidebarLinks = document.querySelectorAll('.sidebar .nav-link');
        sidebarLinks.forEach(link => {
            link.classList.remove('active');
        });
        
        if (page === 'dashboard') {
            sidebarLinks[0].classList.add('active');
        } else if (page === 'add-pr') {
            sidebarLinks[1].classList.add('active');
        }
    }
}

// Load homeworks untuk halaman publik
function loadHomeworks() {
    const prList = document.getElementById('pr-list');
    if (!prList) return;
    
    prList.innerHTML = '';
    
    // Ambil data PR yang visible dari Firestore
    db.collection('homeworks')
        .where('is_visible', '==', true)
        .orderBy('deadline', 'asc')
        .get()
        .then(snapshot => {
            if (snapshot.empty) {
                prList.innerHTML = '<div class="col-12"><p class="text-center">Tidak ada PR yang tersedia.</p></div>';
                return;
            }
            
            snapshot.forEach(doc => {
                const homework = doc.data();
                const prCard = createHomeworkCard(homework, doc.id);
                prList.appendChild(prCard);
            });
        })
        .catch(error => {
            console.error("Error getting homeworks:", error);
            prList.innerHTML = '<div class="col-12"><p class="text-center">Terjadi kesalahan saat memuat data.</p></div>';
        });
}

// Membuat card PR untuk halaman publik
function createHomeworkCard(homework, id) {
    const prCard = document.createElement('div');
    prCard.className = 'col-md-6 col-lg-4 mb-4';
    
    const statusClass = homework.status === 'selesai' ? 'status-selesai' : 'status-belum';
    const statusText = homework.status === 'selesai' ? 'Selesai' : 'Belum';
    
    // Format deadline
    const deadline = new Date(homework.deadline);
    const formattedDeadline = deadline.toLocaleDateString('id-ID', { 
        day: 'numeric', 
        month: 'short', 
        year: 'numeric' 
    });
    
    // PDF button
    let pdfButton = '';
    if (homework.pdf_url) {
        pdfButton = `
            <div class="mt-2">
                <a href="${homework.pdf_url}" target="_blank" class="btn btn-sm btn-outline-primary">
                    <i class="bi bi-file-pdf"></i> Lihat PDF
                </a>
            </div>
        `;
    }
    
    prCard.innerHTML = `
        <div class="card h-100">
            <div class="card-header">
                ${homework.subject}
            </div>
            <div class="card-body d-flex flex-column">
                <h5 class="card-title">${homework.title}</h5>
                <p class="card-text flex-grow-1">${homework.description}</p>
                <div class="d-flex justify-content-between align-items-center mt-3">
                    <span class="status-badge ${statusClass}">${statusText}</span>
                    <small class="text-muted"><i class="bi bi-calendar-event"></i> ${formattedDeadline}</small>
                </div>
                ${pdfButton}
            </div>
        </div>
    `;
    
    return prCard;
}

// Load homeworks untuk dashboard admin
function loadAdminHomeworks() {
    const adminPrList = document.getElementById('admin-pr-list');
    if (!adminPrList) return;
    
    adminPrList.innerHTML = '';
    
    // Ambil semua data PR dari Firestore
    db.collection('homeworks')
        .orderBy('deadline', 'asc')
        .get()
        .then(snapshot => {
            if (snapshot.empty) {
                adminPrList.innerHTML = '<tr><td colspan="7" class="text-center">Tidak ada PR yang tersedia.</td></tr>';
                return;
            }
            
            snapshot.forEach(doc => {
                const homework = doc.data();
                const prRow = createAdminHomeworkRow(homework, doc.id);
                adminPrList.appendChild(prRow);
            });
        })
        .catch(error => {
            console.error("Error getting homeworks:", error);
            adminPrList.innerHTML = '<tr><td colspan="7" class="text-center">Terjadi kesalahan saat memuat data.</td></tr>';
        });
}

// Membuat row PR untuk dashboard admin
function createAdminHomeworkRow(homework, id) {
    const prRow = document.createElement('tr');
    
    const statusClass = homework.status === 'selesai' ? 'status-selesai' : 'status-belum';
    const statusText = homework.status === 'selesai' ? 'Selesai' : 'Belum';
    
    const visibilityClass = homework.is_visible ? 'visibility-visible' : 'visibility-hidden';
    const visibilityText = homework.is_visible ? 'Terlihat' : 'Tersembunyi';
    
    // Format deadline
    const deadline = new Date(homework.deadline);
    const formattedDeadline = deadline.toLocaleDateString('id-ID', { 
        day: 'numeric', 
        month: 'short', 
        year: 'numeric' 
    });
    
    // PDF info
    let pdfInfo = '-';
    if (homework.pdf_url) {
        pdfInfo = `<a href="${homework.pdf_url}" target="_blank" class="btn btn-sm btn-primary">
            <i class="bi bi-file-pdf"></i> Lihat
        </a>`;
    }
    
    prRow.innerHTML = `
        <td>${homework.subject}</td>
        <td>${homework.title}</td>
        <td>${formattedDeadline}</td>
        <td>
            <span class="status-badge ${statusClass}">${statusText}</span>
        </td>
        <td>${pdfInfo}</td>
        <td>
            <span class="visibility-badge ${visibilityClass}">${visibilityText}</span>
        </td>
        <td>
            <div class="btn-group btn-group-sm">
                <button onclick="editHomework('${id}')" class="btn btn-outline-primary">
                    <i class="bi bi-pencil"></i>
                </button>
                <button onclick="deleteHomework('${id}')" class="btn btn-outline-danger">
                    <i class="bi bi-trash"></i>
                </button>
            </div>
        </td>
    `;
    
    return prRow;
}

// Filter homeworks
function filterHomeworks() {
    const subject = document.getElementById('subject').value;
    const sort = document.getElementById('sort').value;
    
    const prList = document.getElementById('pr-list');
    prList.innerHTML = '';
    
    let query = db.collection('homeworks').where('is_visible', '==', true);
    
    // Filter by subject
    if (subject) {
        query = query.where('subject', '==', subject);
    }
    
    // Sort by deadline
    if (sort === 'deadline_asc') {
        query = query.orderBy('deadline', 'asc');
    } else {
        query = query.orderBy('deadline', 'desc');
    }
    
    query.get()
        .then(snapshot => {
            if (snapshot.empty) {
                prList.innerHTML = '<div class="col-12"><p class="text-center">Tidak ada PR yang tersedia dengan filter ini.</p></div>';
                return;
            }
            
            snapshot.forEach(doc => {
                const homework = doc.data();
                const prCard = createHomeworkCard(homework, doc.id);
                prList.appendChild(prCard);
            });
        })
        .catch(error => {
            console.error("Error filtering homeworks:", error);
            prList.innerHTML = '<div class="col-12"><p class="text-center">Terjadi kesalahan saat memuat data.</p></div>';
        });
}

// Add homework function
function addHomework() {
    const form = document.getElementById('add-pr-form');
    const formData = new FormData(form);
    
    const newHomework = {
        subject: formData.get('subject'),
        title: formData.get('title'),
        description: formData.get('description'),
        deadline: formData.get('deadline'),
        status: formData.get('status'),
        is_visible: formData.get('is_visible') === 'on',
        pdf_url: formData.get('pdf-url') || '',
        created_at: firebase.firestore.FieldValue.serverTimestamp()
    };
    
    db.collection('homeworks').add(newHomework)
        .then((docRef) => {
            console.log("Document written with ID: ", docRef.id);
            
            // Reset form
            form.reset();
            
            // Show success message
            alert('PR berhasil ditambahkan!');
            
            // Go to dashboard
            showPage('dashboard');
            
            // Reload homeworks
            loadAdminHomeworks();
        })
        .catch((error) => {
            console.error("Error adding document: ", error);
            alert('Terjadi kesalahan saat menambah PR.');
        });
}

// Edit homework function
function editHomework(id) {
    db.collection('homeworks').doc(id).get()
        .then(doc => {
            if (doc.exists) {
                const homework = doc.data();
                
                // Fill form with homework data
                document.getElementById('edit-id').value = id;
                document.getElementById('edit-subject').value = homework.subject;
                document.getElementById('edit-title').value = homework.title;
                document.getElementById('edit-description').value = homework.description;
                document.getElementById('edit-deadline').value = homework.deadline;
                
                // Set status radio
                if (homework.status === 'selesai') {
                    document.getElementById('edit-status-selesai').checked = true;
                } else {
                    document.getElementById('edit-status-belum').checked = true;
                }
                
                // Set visibility checkbox
                document.getElementById('edit-is-visible').checked = homework.is_visible;
                
                // Set PDF URL
                document.getElementById('edit-pdf-url').value = homework.pdf_url || '';
                
                // Show current PDF if exists
                const currentPdfContainer = document.getElementById('current-pdf-container');
                const currentPdfLink = document.getElementById('current-pdf-link');
                
                if (homework.pdf_url) {
                    currentPdfContainer.style.display = 'block';
                    currentPdfLink.href = homework.pdf_url;
                } else {
                    currentPdfContainer.style.display = 'none';
                }
                
                // Show edit page
                showPage('edit-pr');
            } else {
                console.log("No such document!");
                alert('PR tidak ditemukan.');
            }
        })
        .catch(error => {
            console.error("Error getting document:", error);
            alert('Terjadi kesalahan saat mengambil data PR.');
        });
}

// Update homework function
function updateHomework() {
    const form = document.getElementById('edit-pr-form');
    const formData = new FormData(form);
    const id = formData.get('id');
    
    const updatedHomework = {
        subject: formData.get('subject'),
        title: formData.get('title'),
        description: formData.get('description'),
        deadline: formData.get('deadline'),
        status: formData.get('status'),
        is_visible: formData.get('is_visible') === 'on',
        pdf_url: formData.get('pdf-url') || '',
        updated_at: firebase.firestore.FieldValue.serverTimestamp()
    };
    
    db.collection('homeworks').doc(id).update(updatedHomework)
        .then(() => {
            console.log("Document successfully updated!");
            
            // Show success message
            alert('PR berhasil diperbarui!');
            
            // Go to dashboard
            showPage('dashboard');
            
            // Reload homeworks
            loadAdminHomeworks();
        })
        .catch((error) => {
            console.error("Error updating document: ", error);
            alert('Terjadi kesalahan saat memperbarui PR.');
        });
}

// Delete homework function
function deleteHomework(id) {
    if (confirm('Apakah Anda yakin ingin menghapus PR ini?')) {
        db.collection('homeworks').doc(id).delete()
            .then(() => {
                console.log("Document successfully deleted!");
                
                // Show success message
                alert('PR berhasil dihapus!');
                
                // Reload homeworks
                loadAdminHomeworks();
            })
            .catch((error) => {
                console.error("Error removing document: ", error);
                alert('Terjadi kesalahan saat menghapus PR.');
            });
    }
}

// Initialize event listeners
document.addEventListener('DOMContentLoaded', function() {
    // Load homeworks on public page
    if (document.getElementById('pr-list')) {
        loadHomeworks();
    }
    
    // Set up filter form
    const filterForm = document.getElementById('filter-form');
    if (filterForm) {
        filterForm.addEventListener('submit', function(e) {
            e.preventDefault();
            filterHomeworks();
        });
    }
    
    // Set up add PR form
    const addPrForm = document.getElementById('add-pr-form');
    if (addPrForm) {
        addPrForm.addEventListener('submit', function(e) {
            e.preventDefault();
            addHomework();
        });
    }
    
    // Set up edit PR form
    const editPrForm = document.getElementById('edit-pr-form');
    if (editPrForm) {
        editPrForm.addEventListener('submit', function(e) {
            e.preventDefault();
            updateHomework();
        });
    }
    
    // Add event listener for remove PDF button
    const removePdfBtn = document.getElementById('remove-pdf-btn');
    if (removePdfBtn) {
        removePdfBtn.addEventListener('click', function() {
            document.getElementById('edit-pdf-url').value = '';
            document.getElementById('current-pdf-container').style.display = 'none';
        });
    }
});