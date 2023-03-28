// On page load, check if the value in local storage is set to true and update the isLoggedIn variable accordingly
window.addEventListener("load", () => {
  if (localStorage.getItem("isLoggedIn") === "true") {
    isLoggedIn = true;
  }
});

function configureStatus() {
  const loggedInLinks = document.querySelectorAll(".loggedin");
  const loggedOutLinks = document.querySelectorAll(".loggedout");

  if (isLoggedIn) {
  const bodyElement = document.querySelector('.body'); 
// Set the margin-right to 15% 
bodyElement.style.marginRight = '15%'; 
    console.log("configuring page: logged in");
    // Set the value in local storage to true
    localStorage.setItem("isLoggedIn", "true");
    // show links for logged in users
    loggedInLinks.forEach((link) => (link.style.display = "block"));
    loggedOutLinks.forEach((link) => (link.style.display = "none"));
    //apply the cookie "username" do id "nav-username"
    document.getElementById("nav-username").innerHTML =
      "Welcome, " + getCookie("username") + "!";
  } else {
  const bodyElement = document.querySelector('.body');
// Set the margin-right to 0%
bodyElement.style.marginRight = '0%';
    console.log("configuring page: logged out");
    // Set the value in local storage to false
    localStorage.setItem("isLoggedIn", "false");
    // show links for logged out users
    loggedInLinks.forEach((link) => (link.style.display = "none"));
    loggedOutLinks.forEach((link) => (link.style.display = "block"));
    //refresh the page
    //window.location.reload();
  }
  //End of navbar configuration
}

//  window.addEventListener('beforeunload', function(event) {
//    localStorage.clear();
//  });

function checkCookie() {
  const username = getCookie("username");
  if (username != "") {
    // Cookie exists
    const cookieParts = username.split(";");
    const cookieName = cookieParts.shift().trim();
    const cookieValue = cookieParts.join(";").trim();
    const expirationDate = new Date(cookieValue);
    const currentDate = new Date();
    if (currentDate > expirationDate) {
      // Cookie has expired
      console.log("Cookie has expired");
      isLoggedIn = false;
      configureStatus();
    } else {
      // Cookie is still valid
      console.log("Cookie is still valid");
    }
  } else {
    // Cookie does not exist
    console.log("Cookie does not exist");
    isLoggedIn = false;
    configureStatus();
  }
}

function getCookie(name) {
  const cookieName = name + "=";
  const decodedCookie = decodeURIComponent(document.cookie);
  const cookieArray = decodedCookie.split(";");

  for (let i = 0; i < cookieArray.length; i++) {
    let cookie = cookieArray[i];
    while (cookie.charAt(0) === " ") {
      cookie = cookie.substring(1);
    }
    if (cookie.indexOf(cookieName) === 0) {
      return cookie.substring(cookieName.length, cookie.length);
    }
  }
  return "";
}

setInterval(checkCookie, 10000);
