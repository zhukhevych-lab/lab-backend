const form = document.getElementById("createForm");
const tableBody = document.getElementById("tableBody");
const errorBox = document.getElementById("errorBox");

let records = JSON.parse(localStorage.getItem("accessRequests")) || [];
let editId = null;

renderTable();


form.addEventListener("submit", function(event){

    event.preventDefault();

    const userName = document.getElementById("userName").value.trim();
    const date = document.getElementById("date").value;
    const accessType = document.getElementById("accessType").value;
    const comments = document.getElementById("comments").value.trim();
    const status = document.getElementById("status").value;

    errorBox.textContent = "";

    if(userName === "" || date === "" || accessType === ""){
        errorBox.textContent = "Заповніть обов'язкові поля";
        return;
    }

    if(editId !== null){

        const record = records.find(r => r.id === editId);

        record.userName = userName;
        record.date = date;
        record.accessType = accessType;
        record.comments = comments;
        record.status = status;

        editId = null;

    } else {

        const record = {
            id: Date.now(),
            userName: userName,
            date: date,
            accessType: accessType,
            comments: comments,
            status: status
        };

        records.push(record);
    }

    saveData();
    renderTable();
    form.reset();

});


function renderTable(){

    tableBody.innerHTML = "";

    records.forEach((record, index) => {

        const row = document.createElement("tr");

        row.innerHTML = `
        <td>${index + 1}</td>
        <td>${record.userName}</td>
        <td>${record.date}</td>
        <td>${record.accessType}</td>
        <td>${record.comments}</td>
        <td>${record.status}</td>
        <td>
            <button onclick="editRecord(${record.id})">Редагувати</button>
            <button onclick="deleteRecord(${record.id})">Видалити</button>
        </td>
        `;

        tableBody.appendChild(row);
    });

}


function deleteRecord(id){

    records = records.filter(record => record.id !== id);

    saveData();
    renderTable();

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