console.log("JS読み込まれてる");

// =========================
// タスク追加
// =========================
function addTask() {
  const input = document.getElementById("taskInput");
  const taskText = input.value.trim();

  if (taskText === "") return;

  const li = createTaskElement(taskText, false);

  document.getElementById("taskList").appendChild(li);

  input.value = "";

  saveTasks();
}

// =========================
// タスク要素を作る（共通化）
// =========================
function createTaskElement(text, completed) {
  const li = document.createElement("li");

  // テキスト部分
  const textSpan = document.createElement("span");
  textSpan.textContent = text;
  li.appendChild(textSpan);

  // 完了状態
  if (completed) {
    li.classList.add("completed");
  }

  // 完了クリック
  li.onclick = function () {
    li.classList.toggle("completed");
    saveTasks();
  };
  
  // ドラッグ可能にする
  li.setAttribute("draggable", "true");

  // ドラッグ開始
  li.addEventListener("dragstart", () => {
    li.classList.add("dragging");
});
  // ドラッグ終了
  li.addEventListener("dragend", () => {
    li.classList.remove("dragging");
    saveTasks(); // 並び替えたら保存
});

  // 編集機能（ダブルクリック）
  enableEdit(li, textSpan);

  // 削除ボタン
  const deleteBtn = document.createElement("button");
  deleteBtn.textContent = "削除";
  deleteBtn.onclick = function (e) {
    e.stopPropagation();
    li.remove();
    saveTasks();
  };

  li.appendChild(deleteBtn);

  return li;
}

// =========================
// 編集機能
// =========================
function enableEdit(li, textSpan) {
  li.ondblclick = function () {
    const input = document.createElement("input");
    input.type = "text";
    input.value = textSpan.textContent;

    li.replaceChild(input, textSpan);
    input.focus();

    // Enterで保存
    input.addEventListener("keypress", function (e) {
      if (e.key === "Enter") {
        textSpan.textContent = input.value.trim() || "（空）";
        li.replaceChild(textSpan, input);
        saveTasks();
      }
    });

    // フォーカス外れても保存
    input.addEventListener("blur", function () {
      textSpan.textContent = input.value.trim() || "（空）";
      li.replaceChild(textSpan, input);
      saveTasks();
    });
  };
}

// =========================
// 保存
// =========================
function saveTasks() {
  const tasks = [];

  document.querySelectorAll("#taskList li").forEach(li => {
    const text = li.querySelector("span").textContent;
    const completed = li.classList.contains("completed");

    tasks.push({
      text: text,
      completed: completed
    });
  });

  localStorage.setItem("tasks", JSON.stringify(tasks));
}

// =========================
// 読み込み
// =========================
function loadTasks() {
  const tasks = JSON.parse(localStorage.getItem("tasks")) || [];

  tasks.forEach(task => {
    const li = createTaskElement(task.text, task.completed);
    document.getElementById("taskList").appendChild(li);
  });
}

// =========================
// Enterキーで追加
// =========================
document.getElementById("taskInput").addEventListener("keypress", function(e) {
  if (e.key === "Enter") {
    addTask();
  }
});

const taskList = document.getElementById("taskList");

taskList.addEventListener("dragover", (e) => {
  e.preventDefault();

  const dragging = document.querySelector(".dragging");
  const afterElement = getDragAfterElement(taskList, e.clientY);

  if (afterElement == null) {
    taskList.appendChild(dragging);
  } else {
    taskList.insertBefore(dragging, afterElement);
  }
});

function getDragAfterElement(container, y) {
  const draggableElements = [...container.querySelectorAll("li:not(.dragging)")];

  return draggableElements.reduce((closest, child) => {
    const box = child.getBoundingClientRect();
    const offset = y - box.top - box.height / 2;

    if (offset < 0 && offset > closest.offset) {
      return { offset: offset, element: child };
    } else {
      return closest;
    }
  }, { offset: Number.NEGATIVE_INFINITY }).element;
}

// =========================
// 初期読み込み
// =========================
window.onload = loadTasks;

if ("serviceWorker" in navigator) {
  navigator.serviceWorker.register("sw.js")
    .then(() => console.log("Service Worker登録成功"))
    .catch(() => console.log("Service Worker登録失敗"));
}