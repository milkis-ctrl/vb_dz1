function addTask() {
    let inputField = document.getElementById('taskInput');
    let taskText = inputField.value;

    if (taskText == "") {
        alert("Пожалуйста, введите задачу!");
    } else {
        let li = document.createElement('li');
        li.innerHTML = '<span class="task-text">' + taskText + '</span>' + 
                       '<button class="delete-btn" onclick="deleteTask(this)">Удалить</button>';
        
        li.onclick = function() {
            if (this.style.textDecoration == "line-through") {
                this.style.textDecoration = "none";
                this.style.color = "black";
            } else {
                this.style.textDecoration = "line-through";
                this.style.color = "gray";
            }
        };

        document.getElementById('taskList').appendChild(li);
        inputField.value = "";
        checkEmptyList();
    }
}

function deleteTask(buttonElement) {
    let li = buttonElement.parentElement;
    li.remove();
    checkEmptyList();
}

function checkEmptyList() {
    let list = document.getElementById('taskList');
    let message = document.getElementById('empty-message');
    
    if (list.children.length == 0) {
        message.style.display = "block";
    } else {
        message.style.display = "none";
    }
}

checkEmptyList();