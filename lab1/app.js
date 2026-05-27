const form = document.getElementById("createForm");
const tableBody = document.getElementById("tableBody");
const errorBox = document.getElementById("errorBox");

// Елементи пошуку та фільтрації
const searchInput = document.getElementById("searchInput");
const statusFilter = document.getElementById("statusFilter");
const sortOrder = document.getElementById("sortOrder");

let records = JSON.parse(localStorage.getItem("accessRequests")) || [];
let editId = null;

// Первинне відображення
renderTable();

// Обробка відправки форми
form.addEventListener("submit", function(event){
    event.preventDefault();

    const userName = document.getElementById("userName").value.trim();
    const date = document.getElementById("date").value;
    const accessType = document.getElementById("accessType").value;
    const comments = document.getElementById("comments").value.trim();
    const status = document.getElementById("status").value;

    errorBox.textContent = "";

    if(userName === "" || date === "" || accessType === ""){
        errorBox.textContent = "Заповніть обов'язкові поля!";
        return;
    }

    if(editId !== null){
        const index = records.findIndex(r => r.id === editId);
        records[index] = { id: editId, userName, date, accessType, comments, status };
        editId = null;
    } else {
        const record = { id: Date.now(), userName, date, accessType, comments, status };
        records.push(record);
    }

    saveData();
    renderTable();
    form.reset();
});

// Слухачі для пошуку та сортування
searchInput.addEventListener("input", renderTable);
statusFilter.addEventListener("change", renderTable);
sortOrder.addEventListener("change", renderTable);

function renderTable(){
    tableBody.innerHTML = "";

    const searchTerm = searchInput.value.toLowerCase();
    const filterValue = statusFilter.value;
    const sortValue = sortOrder.value;

    // 1. Фільтрація та пошук
    let processedRecords = records.filter(record => {
        const matchesSearch = record.userName.toLowerCase().includes(searchTerm);
        const matchesStatus = filterValue === "all" || record.status === filterValue;
        return matchesSearch && matchesStatus;
    });

    // 2. Сортування за датою
    processedRecords.sort((a, b) => {
        const dateA = new Date(a.date);
        const dateB = new Date(b.date);
        return sortValue === "asc" ? dateA - dateB : dateB - dateA;
    });

    // 3. Відтворення рядків
    processedRecords.forEach((record, index) => {
        const row = document.createElement("tr");
        row.innerHTML = `
            <td>${index + 1}</td>
            <td>${record.userName}</td>
            <td>${record.date}</td>
            <td>${record.accessType}</td>
            <td>${record.comments}</td>
            <td><span class="status-badge">${record.status}</span></td>
            <td>
                <button class="action-btn edit" onclick="editRecord(${record.id})">Ред.</button>
                <button class="action-btn delete" onclick="deleteRecord(${record.id})">Вид.</button>
            </td>
        `;
        tableBody.appendChild(row);
    });
}

function deleteRecord(id){
    if(confirm("Ви дійсно хочете видалити цей запис?")) {
        records = records.filter(record => record.id !== id);
        saveData();
        renderTable();
    }
}

function editRecord(id){
    const record = records.find(r => r.id === id);
    document.getElementById("userName").value = record.userName;
    document.getElementById("date").value = record.date;
    document.getElementById("accessType").value = record.accessType;
    document.getElementById("comments").value = record.comments;
    document.getElementById("status").value = record.status;
    editId = id;
}

function saveData(){
    localStorage.setItem("accessRequests", JSON.stringify(records));
}