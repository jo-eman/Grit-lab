const Login = {
  render: async () => {
    // form for login
    return `
            <div class="login">
                <div class="loginContainer">
                <div class="login-left-column">

                </div>
                <div class="login-right-column">
                    <form id="login-form">
                        <h1><center>Login</h1>
                        <div class="form-group">
                            <label for="credential">Username/Email</label>
                            <input class="formInput" type="credential" name="credential" id="credential" placeholder="Enter credential">
                            
                            </div>
                            <div class="notification" id="notification-user"></div>
                        <div class="form-group">
                            <label for="password">Password</label> 
                            <input class="formInput" type="password" name="password" id="password" placeholder="Enter Password">
                            </div>
                            <div class="notification" id="notification-pw"></div>
                        <button type="submit" class="btn btn-primary btn-block btn-large">Submit</button>
                    </form>
                </div>
                </div>
            </div>
        `;
  },
  afterRender: async () => {
   configureStatus();
    // login form submit event
    document
      .getElementById("login-form")
      .addEventListener("submit", async (e) => {
        e.preventDefault();
        const credential = document.getElementById("credential").value;
        const password = document.getElementById("password").value;
        const response = await fetch("http://localhost:8000/api/users/login", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            credential,
            password,
          }),
        });
        //If post request (login) is unsuccessful, alert the user with the http error text
        if (!response.ok) {
          //clear contents of notification divs using class name and foreach so we don't present multiple error messages
          const notificationDivs = document.getElementsByClassName("notification");
          Array.from(notificationDivs).forEach((div) => {
            div.innerHTML = "";
            div.style.display = "none";
          });
          const data = await response.text();
          if (data.includes("user")) {
            document.getElementById("notification-user").innerHTML = "Oops! Wrong username/email";
            document.getElementById("notification-user").style.display = "block";
          }
          if (data.includes("password")) {
            document.getElementById("notification-pw").innerHTML = "Oops! Wrong password";
            document.getElementById("notification-pw").style.display = "block";
          return;
        }
        }



        const data = await response.json();
        console.log(data)
        if (data.success) {
          isLoggedIn = true;
          await configureStatus();
          // render home page

          // const home = await Home.render();
          // document.getElementById("content").innerHTML = home;
          // await Home.afterRender();
          window.location.hash = "/";
        } else {
          alert(data.message);
        }
      });
  },
};
