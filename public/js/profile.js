$(".input-tags").focus(function () {
  $("#submit").css("visibility", "visible");
  $("#reset").css("visibility", "visible");
});

$("#submit").on("click", function () {
  var formData = {
    name: $("#name").val(),
    email: $("#email").val(),
    password: $("#password").val(),
    age: $("#age").val(),
  };
  console.log(formData);
  $.ajax({
    type: "PATCH",
    url: "/users/me",
    data: formData,
    success: function () {
      window.location.reload();
    },
  });
});
$("#reset").on("click", () => {
  window.location.reload();
});

var modal4 = document.getElementById("myModal4");
function showModal4() {
  modal4.style.display = "block";
}

function closeModal() {
  modal4.style.display = "none";
  document.getElementById("confirm_text").value = "";
}
function deleteImg() {
  $.ajax({
    type: "DELETE",
    url: "/users/me/avatar",
  });
  window.location.href = "/users/me";
}
document.getElementById("image").onchange = function () {
  document.getElementById("image-form").submit();
};

function confirmDelete(username) {
  let confirm_text = document.getElementById("confirm_text").value;
  if (confirm_text == username) {
    $.ajax({
      type: "DELETE",
      url: "/users/me",
      success: function () {
        window.location.reload();
      },
    });
    window.location.reload();
  }
}
