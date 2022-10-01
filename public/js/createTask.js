// create Task Function
$("#create_btn_new").on("click", () => {
  const formData2 = {
    title: $("#title_new").val(),
    description: $("#desc_new").val(),
    progress: $("#percent_new").val(),
    status: $("#status_new").val(),
    createdDate: today2,
    dueDate: $("#due_new").val(),
  };
  console.log(formData2.description);
  if (formData2.description.length > 0 && formData2.title.length > 0) {
    $.ajax({
      type: "POST",
      url: "/tasks",
      data: formData2,
      success: function () {
        window.location.reload();
      },
    });
  }
});
// ------------------//

// Delete task Function
function deleteTask(id) {
  $.ajax({
    type: "DELETE",
    url: "/tasks/" + id,
  });
  window.location.reload();
}
// ------------------//

// Modal Display and close functions
var modal = document.getElementById("myModal");
var modal2 = document.getElementById("myModal2");
var modal3 = document.getElementById("myModal3");
function showModal() {
  modal.style.display = "block";
}
function showModal2() {
  modal2.style.display = "block";
}
function showModal3() {
  modal3.style.display = "block";
}

function closeModal() {
  modal.style.display = "none";
  modal2.style.display = "none";
  modal3.style.display = "none";
}
// ------------------//

// global task id variable
var TaskId;

// Populate Edit task Modal
function populateModal(i, taskId) {
  var title = document.getElementById("title_" + i).innerText;
  var desc = document.getElementById("desc_" + i).innerText;
  var status = document.getElementById("status_" + i).innerText;
  var percent = document.getElementById("percent_" + i).innerText.trim();
  var due = document.getElementById("due_" + i).innerText;
  TaskId = taskId;
  $.ajax({
    type: "GET",
    url: `/tasks/${taskId}`,
    success: function (data) {
      task = { ...data };
      document.getElementById("title").value = title;
      document.getElementById("desc").value = task.description;
      document.getElementById("status").value = status;
      document.getElementById("percent").value = percent;
      document.getElementById("percent_num").value = percent;
      document.getElementById("due").value = due;
    },
  });
}
// ------------------//

// Populate percentage field in Create modal
function populateModal2() {
  document.getElementById("percent_new").value = 0;
  document.getElementById("percent_num_new").value = 0;
}
// ------------------//

// Converting date to proper format
var today = new Date().toISOString().split("T")[0];
document.getElementById("due").setAttribute("min", today);

var today2 = new Date().toISOString().split("T")[0];
document.getElementById("due_new").setAttribute("min", today2);
// ------------------//

//Edit task Function
$("#edit_btn").on("click", () => {
  const formData = {
    title: $("#title").val(),
    description: $("#desc").val(),
    progress: $("#percent").val(),
    status: $("#status").val(),
    dueDate: $("#due").val(),
  };
  if (formData.description.length > 0 && formData.title.length > 0) {
    $.ajax({
      type: "PATCH",
      url: "/tasks/" + TaskId,
      data: formData,
      success: function () {
        window.location.reload();
      },
    });
  }
  console.log(TaskId);
});
// ------------------//

// Setting value in filter bar
var array_status = window.location.href.split("=");
var status_val = decodeURIComponent(array_status[1]);
console.log(status_val);
if (
  status_val == "Not Started" ||
  status_val == "Completed" ||
  status_val == "In Progress"
) {
  document.getElementById("status-value").innerHTML = status_val;
} else {
  document.getElementById("status-value").innerHTML = "All";
}
// ------------------//

// Search function
let search = document.getElementById("searchBox");
search.addEventListener("input", function () {
  let inputVal = search.value.toLowerCase();
  console.log("Input event fired!", inputVal);
  let taskCards = document.getElementsByClassName("card-head");
  Array.from(taskCards).forEach(function (element) {
    let cardTxt = element
      .getElementsByTagName("div")[0]
      .innerText.toLowerCase();
    if (cardTxt.includes(inputVal)) {
      element.parentElement.parentElement.style.display = "block";
    } else {
      element.parentElement.parentElement.style.display = "none";
    }
  });
});
// ------------------//

// Full description function for long desc
function full_desc(id, taskId) {
  let serial = Number(id) + 1;
  document.getElementById("task_desc_id").innerHTML =
    "Task " + serial + " Description";
  $.ajax({
    type: "GET",
    url: `/tasks/${taskId}`,
    success: function (data) {
      task = { ...data };
      document.getElementById("full_desc").innerText = task.description;
    },
  });
}

let read_more_array = document.getElementsByClassName("read_more");
let desc_text_array = document.getElementsByClassName("description_text");

for (let i = 0; i < read_more_array.length; i++) {
  if (desc_text_array[i].innerText.length >= 67) {
    read_more_array[i].style.display = "block";
  }
}
// ------------------//
