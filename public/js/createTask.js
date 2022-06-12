document.getElementsByClassName("navbar-nav").innerHTML = `
        <li class="nav-item">
          <a class="nav-link" aria-current="page" href="/" style="font-size: px;">Home</a>
        </li>
        <li class="nav-item">
          <a class="nav-link" href="/about">About</a>
        </li>
        
        <li class="nav-item">
          <a class="nav-link" href="/users/me">Profile</a>
        </li>
        
        <li class="nav-item">
          <a class="nav-link" href="/users/logout">Logout</a>
        </li>
`;

// Get the modal
var modal = document.getElementById("myModal");

// Get the button that opens the modal
var btn = document.getElementById("createTask");

// Get the <span> element that closes the modal
var span = document.getElementsByClassName("close")[0];

// When the user clicks the button, open the modal
btn.onclick = function () {
  modal.style.display = "block";
};

// When the user clicks on <span> (x), close the modal
span.onclick = function () {
  modal.style.display = "none";
};

// When the user clicks anywhere outside of the modal, close it
window.onclick = function (event) {
  if (event.target == modal) {
    modal.style.display = "none";
  }
};
