const Register = {
  render: async () => {
    return `
            <div class="register">
                <div class="registerContainer">
                 <div class="register-left-column">
                 </div>
                    <div class="register-right-column">
                        <form id="register-form">

                            <h1><center>Register</h1>
                            <div class="form-group">
                                <label for="username">Username</label>
                                <input class="formInput" type="text" name="username" id="username" placeholder="Enter Username">
                            </div>
                            <div class="notification" id="reg-username"></div>
                            <div class="form-group">
                            <label for="realname">Real Name</label>
                            <input class="formInput" type="text" name="realname" id="realname" placeholder="Enter Real Name">
                            </div>
                            <div class="form-group">
                            <label for="gender">Gender</label>
                            <input class="formInput" type="text" name="gender" id="gender" placeholder="Enter Real Gender">
                            </div>
                            <div class="form-group">
                            <label for="age">Age</label>
                            <input class="formInput" type="text" name="age" id="age" placeholder="Enter Age">
                            </div>
                            <div class="form-group">
                                <label for="email">Email</label>
                                <input class="formInput" type="email" name="email" id="email" placeholder="Enter Email">
                            </div>
                            <div class="notification" id="reg-email"></div>
                            <div class="form-group">
                            <label for="password">Password</label>
                            <input class="formInput" type="password" name="password" id="password" placeholder="Enter Password">
                            </div>
                            <div class="notification" id="fields-required"></div>
                            <button type="submit" class="btn btn-primary btn-block btn-large">Submit</button>
                        </form>
                    </div>
                </div>
            </div>
        `;
  },
  afterRender: async () => {
    document
      .getElementById("register-form")
      .addEventListener("submit", async (e) => {
        e.preventDefault();
        const username = document.getElementById("username").value;
        const realname = document.getElementById("realname").value;
        const gender = document.getElementById("gender").value;
        const age = document.getElementById("age").value;
        const email = document.getElementById("email").value;
        const password = document.getElementById("password").value;
        //If any of the fields are empty, alert the user by populating fields-required div
        if (!username || !realname || !gender || !age || !email || !password) {
          //clear contents of notification divs using class name and foreach so we don't present multiple error messages
          const notificationDivs = document.getElementsByClassName("notification");
          Array.from(notificationDivs).forEach((div) => {
            div.innerHTML = "";
            div.style.display = "none";
          });
          document.getElementById("fields-required").innerHTML = "Please fill in all fields (this is a data mining op)";
          document.getElementById("fields-required").style.display = "block";
          return;
        }
        const response = await fetch(
          "http://localhost:8000/api/users/register",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              username,
              realname,
              gender,
              age,
              email,
              password,
            }),
          }
        );
        //If post request (login) is unsuccessful, alert the user with the http error text
        if (!response.ok) {
          //clear contents of notification divs using class name and foreach so we don't present multiple error messages
          const notificationDivs = document.getElementsByClassName("notification");
          Array.from(notificationDivs).forEach((div) => {
            div.innerHTML = "";
            div.style.display = "none";
          });
          const data = await response.text();
          if (data.includes("users.username")) {
            document.getElementById("reg-username").innerHTML = "Oops! Username already exists";
            document.getElementById("reg-username").style.display = "block";
          }
          if (data.includes("email")) {
            document.getElementById("reg-email").innerHTML = "Oops! Email already exists";
            document.getElementById("reg-email").style.display = "block";
          return;
        }
        }



        const data = await response.json();
        if (data.success) {
          localStorage.setItem("token", data.token);
          window.location.hash = "/";
          isLoggedIn = true;
        } else {
          alert(data.message);
        }
      });
  },
};
