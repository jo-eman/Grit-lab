const loggedInLinks = document.querySelectorAll(".loggedin");
const loggedOutLinks = document.querySelectorAll(".loggedout");

if (isLoggedIn) {
  // show links for logged in users
  loggedInLinks.forEach((link) => (link.style.display = "block"));
  loggedOutLinks.forEach((link) => (link.style.display = "none"));
} else {
  // show links for logged out users
  loggedInLinks.forEach((link) => (link.style.display = "none"));
  loggedOutLinks.forEach((link) => (link.style.display = "block"));
}
//End of navbar configuration

// todo change hardcoded localhost

const Home = {
  render: async () => {
    checkCookie();
    const posts = await getPosts();

    return `
      <p class="titlehome"><b><u>Singles page application</u></b></p>
      <p class="introduction loggedout">Welcome to the Åland Dating Forum, the premier online community for Ålanders looking to connect, share experiences, and find love. Whether you're new to the dating scene or a seasoned pro, our forum offers a safe and inclusive space where you can discuss a wide range of topics related to dating, relationships, and love. 
      Our forum is designed to bring together Ålanders from all walks of life, with different backgrounds, beliefs, and experiences. We believe that love knows no bounds and that everyone deserves a chance to find meaningful connections with others. 
      At the Åland Dating Forum, you can connect with like-minded individuals, share your own dating stories and advice, seek guidance from others, or simply browse and learn from others' experiences. Our community is open and supportive, and we welcome members of all genders, sexual orientations, and relationship statuses. 
      <br><br>
      Join our forum today and start exploring the world of dating and relationships in Åland. Whether you're looking for casual dating, a long-term partner, or just new friends, we've got you covered. Sign up now and become part of our vibrant and growing community of Ålanders looking to find love and connection.</p>
      ${posts
        .map(
          (post) => `
        <div id="${post.id}" class="subject loggedin">
            <div class="subjectContainer">
              <div class="container-left-column">
                <div class="container-center-column">
                  <p class="title">
                    ${post.title}
                  </p>
                  <p class="username">
                    By: ${post.author}
                    </p>
                  <p class="content">
                    ${post.content}
                  </p>
                  <p class="tags">
                    Category tags: ${post.tags}
                  </p>
                </div>
              </div>
              <div class="container-right-column">
              
                <p class="comments" id="comments-${post.id}">
                ${post.comments ? post.comments.length : "No"} comment(s)
                </p>
              </div>
            </div>
          <div class="comments-container" style="display:none;">
            <input type="text" placeholder="Add a comment" id="comment-input-${
              post.id
            }">
            <button id="comment-button-${post.id}">Add comment</button>
            <div class="comments-list">
            ${
              post.comments
                ? post.comments
                    .map(
                      (comment) => `
                    <div class="comment">
                        <p class="username">Author: ${comment.username}</p>
                        <p class="content">${comment.content}</p>
                    </div>
                `
                    )
                    .join("")
                : "No comments"
            }
            </div>
          </div>
        </div>
      `
        )
        .join("")}
    `;
  },
  afterRender: async () => {
    configureStatus();
    const posts = await getPosts();

    posts.forEach((post) => {
      const commentsContainer = document.getElementById(
        `comment-input-${post.id}`
      ).parentNode;
      const commentsList = commentsContainer.querySelector(".comments-list");

      document
        .getElementById(`comments-${post.id}`)
        .addEventListener("click", () => {
          const commentsContainerDisplay = commentsContainer.style.display;
          commentsContainer.style.display =
            commentsContainerDisplay === "none" ? "block" : "none";
        });
      document
        .getElementById(`comment-button-${post.id}`)
        .addEventListener("click", async () => {
          const input = document.getElementById(`comment-input-${post.id}`);
          const content = input.value.trim();

          if (!content) {
            alert("Please enter a comment.");
            return;
          }

          const seshtoken = getCookie("session");

          const comment = {
            post_id: post.id,
            username: seshtoken,
            content: content,
            timestamp: new Date().toISOString(),
          };

          try {
            const response = await fetch(
              "http://localhost:8000/api/createcomment",
              {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify(comment),
              }
            );

            // if response 201 created
            if (response.status === 201) {
              const newComment = await response.json();
              const currentUser = getCookie("username");
              newComment.username = currentUser;
              if (!post.comments) {
                post.comments = [];
              }
              //sanitze the comment
              newComment.content = sanitize(newComment.content);
              
              post.comments.push(newComment);
              commentsList.innerHTML += `
                <div class="comment">
                  <p class="username">Author: ${newComment.username}</p>
                    <p class="content">${newComment.content}</p>
                </div>
                `;
              input.value = "";
            } else {
              console.log(response.status);
            }
          } catch (error) {
            console.log(error);
            //alert("Something went wrong. Please try again.");
          }
        });
    });
    if (isLoggedIn) {
      await getUsersList();
      if (wsOpened == false) {
        startWebSocket();
      }
    }
  },
};

const getPosts = async () => {
  const response = await fetch("http://localhost:8000/api/posts");
  const topics = await response.json();
  //sanitize the data in the topics
  topics.forEach((topic) => {
    topic.title = sanitize(topic.title);
    topic.content = sanitize(topic.content);
    topic.tags = sanitize(topic.tags);
    topic.author = sanitize(topic.author);
    if (topic.comments) {
    topic.comments.forEach((comment) => {
      comment.username = sanitize(comment.username);
      comment.content = sanitize(comment.content);
    })
    };
  });


  return topics;
};

const sanitize = (str) => {
  const temp = document.createElement("div");
  temp.textContent = str;
  return temp.innerHTML;
}