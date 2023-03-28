console.log(localStorage.getItem("isLoggedIn"));
let isLoggedIn = localStorage.getItem("isLoggedIn") === "true";
let wsOpened = false;
let ws;
let userlist = [];
var typingTimer;
