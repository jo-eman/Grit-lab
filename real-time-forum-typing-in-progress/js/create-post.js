const CreatePost = {
  render: async () => {
    // function to create a post
    return `
            <div class="create-post">
                <div class="create-post-container">

                    <div class="create-post-left-column">
                    </div>
                    <div class="create-post-right-column">

                        <form id="create-post-form">
                            <h1>Create Post</h1>
                            <div class="form-group">
                                <label for="title">Title</label>
                                <input type="text" name="title" id="title" placeholder="Enter Title">
                            </div>
                            <div class="form-group">
                                <label for="content">Content</label>
                                <textarea name="content" id="content" cols="30" rows="10" placeholder="Enter Content"></textarea>
                            </div>
                            <div class="form-group">
                                <label for="tags">Tags</label>
                                <input type="text" name="tags" id="tags" placeholder="Enter category tags separated by comma">
                            </div>
                            <button type="submit" class="btn btn-primary btn-block btn-large">Create Post</button>
                        </form>
                    </div>
                </div>
            </div>
        `;
  },
  afterRender: async () => {
    await configureStatus();
    document
      .getElementById("create-post-form")
      .addEventListener("submit", async (e) => {
        e.preventDefault();
        const form = document.getElementById("create-post-form");
        const formData = new FormData(form);
        const postData = {};
        formData.forEach((value, key) => {
          postData[key] = value;
        });
        //get the value of cookie "session"
        const session = getCookie("session");
        postData["author"] = session;
       
        const response = await fetch("http://localhost:8000/api/createpost", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(postData),
        });
        if (response.ok) {
          window.location.hash = "/";
        }
      });
  },
};
