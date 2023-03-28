async function logOut() {
  // Set the expiration date to a date in the past
  document.cookie = "username=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
  document.cookie = "session=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
  isLoggedIn = false;
  configureStatus();
  window.location.hash = "/";

  localStorage.clear();
  //Close websocket
  if (wsOpened) {
    ws.close();
    wsOpened = false;
  }
  
  
  //Clear the content div
  document.getElementById("content").innerHTML = "";
  //Clear the userlist
  userlist = [];
  // remove all user-items
  const userItems = document.querySelectorAll(".user-item");
  userItems.forEach((item) => item.remove());

  // clear the
  //render home page
  const home = await Home.render();
  document.getElementById("content").innerHTML = home;
  await Home.afterRender();
  window.location.hash = "/";
}
