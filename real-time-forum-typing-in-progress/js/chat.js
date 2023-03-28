// When you click on a name in the ChadChat, open up a modal with a chat box.
// Through this chat box, you can send and receive messages with the user by using the websocket connection.
const openDirectMessageModal = async (receiver) => {
  //append the modal divs to the body
  const modal = document.createElement("div");
  modal.id = "direct-message-modal";
  modal.classList.add("modal");
  receiver = await clearUnreadMessage(receiver);
  modal.innerHTML = `
      <div class="modal-content" id="direct-message-modal-content">
        <span class="close" id="direct-message-modal-close">&times;</span>
        <h1 id="direct-message-modal-title">Chat with ${receiver}</h1>
        <div id="direct-message-modal-chat"></div>
        <input type="text" id="direct-message-modal-input" placeholder="Type a message..."/>
        <button id="direct-message-modal-send">Send</button>
      </div>
    `;

  const chatBox = modal.querySelector("#direct-message-modal-chat");

  // get message history from server
  const response = await fetch(
    `http://localhost:8000/api/messages?receiver_id=${receiver}`
  );
  const messagehistory = await response.json();

  // if there are messages, show them
  if (messagehistory) {
    //sort messages by timestamp
    await messagehistory.sort((a, b) => {
      const dateA = new Date(a.timestamp);
      const dateB = new Date(b.timestamp);
      return dateA.getTime() - dateB.getTime();
    });

    let messagesToShow = messagehistory.slice(-10);

    for (let i = 0; i < messagesToShow.length; i++) {
      //if timestamp is from safari, change it to a format that can be parsed
      


      //change timestamp format
      const newTtimestamp = new Date(messagesToShow[i].timestamp);
      if (newTtimestamp != "Invalid Date") {
        messagesToShow[i].timestamp = newTtimestamp.toLocaleString();
      }

      const message = messagesToShow[i];

      const messageDiv = document.createElement("div");
      messageDiv.classList.add("message");
      messageDiv.innerHTML = `
        <p class="message-timestamp">${message.timestamp}</p>
          <p class="message-from">${message.sender_id}</p>
          <p class="message-content"> : ${sanitize(message.message)}</p>
        `;
      chatBox.appendChild(messageDiv);
    }

    chatBox.addEventListener("scroll", async () => {
      if (chatBox.scrollTop === 0) {
        const moreMessages = messagehistory.slice(
          -messagesToShow.length - 10,
          -messagesToShow.length
        );

        messagesToShow = [...moreMessages, ...messagesToShow];

        // reverse the order of the messages
        moreMessages.reverse();

        for (let i = 0; i < moreMessages.length; i++) {
          const message = moreMessages[i];
          const messageDiv = document.createElement("div");
          messageDiv.classList.add("message");
          messageDiv.innerHTML = `
            <p class="message-timestamp">${message.timestamp}</p>
              <p class="message-from">${message.sender_id}</p>
              <p class="message-content"> : ${sanitize(message.message)}</p>
            `;

          chatBox.insertBefore(messageDiv, chatBox.firstChild);
        }
      }
    });
  }

  document.body.appendChild(modal);
  const modalClose = modal.querySelector("#direct-message-modal-close");
  const modalTitle = modal.querySelector("#direct-message-modal-title");
  const modalInput = modal.querySelector("#direct-message-modal-input");
  const modalSend = modal.querySelector("#direct-message-modal-send");

  //detect if user is typing in the input field
  let isTypingSent = false;
  let typingTimeout;

  modalInput.addEventListener("input", () => {
    if (modalInput.value.trim()) {
      if (!isTypingSent) {
        ws.send(
          JSON.stringify({
            type: "isTyping",
            message: "yes",
            from: getCookie("username"),
            to: receiver,
          })
        );
        isTypingSent = true;
      }
      clearTimeout(typingTimeout);
      typingTimeout = setTimeout(() => {
        if (isTypingSent) {
          ws.send(
            JSON.stringify({
              type: "isTyping",
              message: "no",
              from: getCookie("username"),
              to: receiver,
            })
          );
          isTypingSent = false;
        }
      }, 5000);
    } else {
      if (isTypingSent) {
        ws.send(
          JSON.stringify({
            type: "isTyping",
            message: "no",
            from: getCookie("username"),
            to: receiver,
          })
        );
        isTypingSent = false;
      }
      clearTimeout(typingTimeout);
    }
  });

  modal.style.display = "block";

  //start with scroll on bottom
  chatBox.scrollTop = chatBox.scrollHeight;

  modalTitle.innerText = `Chat with ${receiver}`;

  modalClose.onclick = function () {
    //remove the modal divs from the body
    modal.style.display = "none";
    modal.remove();
  };

  window.onclick = function (event) {
    if (event.target == modal) {
      modal.style.display = "none";
      modal.remove();
    }
  };

  modalSend.onclick = function () {
    const message = modalInput.value.trim();
    if (!message) {
      alert("Please enter a message.");
      return;
    }
    const username = getCookie("username");
    const data = {
      from: username,
      to: receiver,
      message: sanitize(message),
      timestamp: new Date().toLocaleString(),
    };

    ws.send(JSON.stringify(data));
    //clear the input field
    modalInput.value = "";
    const messageDiv = document.createElement("div");
    messageDiv.classList.add("message");
    messageDiv.innerHTML = `
        <p class="message-timestamp">${data.timestamp}</p>
          <p class="message-from">${data.from}</p>
          <p class="message-content"> : ${data.message}</p>
        `;
    chatBox.appendChild(messageDiv);
    chatBox.scrollTop = chatBox.scrollHeight;
    updateLastMessageTimestamp(receiver, data.timestamp);
  };
};

async function getUsersList() {
  const response = await fetch("http://localhost:8000/api/users/list", {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });
  newlist = await response.json();
  if (userlist.length === 0) {
    userlist = newlist;
  } else {
    for (const user of newlist) {
      if (!userlist.map((user) => user.username).includes(user.username)) {
        userlist.push(user);
      }
    }
  }
  sortUsers(userlist);
}

const updateLastMessageTimestamp = (chatuser, timestamp) => {
  for (const user of userlist) {
    if (user.username === chatuser) {
      user.last_message_time = timestamp;
    }
  }
  sortUsers(userlist);
};

const addOnlineStatus = (onlineusers) => {
  //add online status to users in userlist
  for (const user of userlist) {
    if (onlineusers.includes(user.username)) {
      user.online = true;
    } else {
      user.online = false;
    }
    //if there is a user in onlineusers that is not in userlist, add it to userlist
    for (const onlineuser of onlineusers) {
      if (!userlist.map((user) => user.username).includes(onlineuser)) {
        userlist.push({
          username: onlineuser,
          last_message_time: "",
          online: true,
        });
      }
    }
  }
  sortUsers(userlist);
};

const sortUsers = (userlist) => {
  // split users to offline and online
  // sort online users by last_message_time
  // sort offline users alphabetically
  // append users to users-list div
  let onlineUsers = [];
  let offlineUsers = [];
  for (const user of userlist) {
    if (user.online) {
      onlineUsers.push(user);
    } else {
      offlineUsers.push(user);
    }
  }

  //split online users to the ones with last message timestamp and the ones without
  let onlineUsersWithTimestamp = [];
  let onlineUsersWithoutTimestamp = [];
  for (const user of onlineUsers) {
    if (user.last_message_time) {
      onlineUsersWithTimestamp.push(user);
    } else {
      onlineUsersWithoutTimestamp.push(user);
    }
  }
  offlineUsers.sort((a, b) => {
    return a.username.localeCompare(b.username);
  });
    //sort online users without timestamp alphabetically
    onlineUsersWithoutTimestamp.sort((a, b) => {
      return a.username.localeCompare(b.username);
    });

  for (let user of onlineUsersWithTimestamp) {
    user.last_message_time = new Date(user.last_message_time).toLocaleString();
  }

  //sort online users with timestamp by last message timestamp
  onlineUsersWithTimestamp.sort((a, b) => {
    return new Date(b.last_message_time) - new Date(a.last_message_time);
  });

  //combine the two arrays
  onlineUsers = onlineUsersWithTimestamp
    .concat(onlineUsersWithoutTimestamp).reverse();

  console.log(onlineUsers);


  renderUserList(onlineUsers, offlineUsers);
};

const renderUserList = (onlineUsers, offlineUsers) => {
  let chatlist = document.getElementById("users-list");

  chatlist.innerHTML = "";
  for (const user of onlineUsers) {
    const userItem = document.createElement("div");
    userItem.classList.add("user-item");
    userItem.innerHTML = user.username;
    userItem.style.color = "green";
    userItem.style.fontWeight = "bold";
    chatlist.insertBefore(userItem, chatlist.firstChild);
  }
  for (const user of offlineUsers) {
    const userItem = document.createElement("div");
    userItem.classList.add("user-item");
    userItem.innerHTML = user.username;
    userItem.style.color = "red";
    userItem.style.fontWeight = "normal";
    chatlist.insertAdjacentElement("beforeend", userItem);
  }
  const userItems = document.getElementsByClassName("user-item");
  for (const item of userItems) {
    item.addEventListener("click", () => {
      openDirectMessageModal(item.innerHTML);
    });
  }
};



const startWebSocket = () => {
  ws = new WebSocket("ws://localhost:8000/ws");
  wsOpened = true;
  ws.onopen = function () {
    console.log("Connected to websocket");
  };

  ws.onmessage = function (event) {
    const data = JSON.parse(event.data);
    if (data.type == "onlineUsers") {
      const onlineusers = data.data;
      addOnlineStatus(onlineusers);
    } else if (data.type == "isTyping") {
      const modal = document.getElementById("direct-message-modal");
      const modalTitle = document.getElementById("direct-message-modal-title");
      
      if (modal && modal.style.display === "block") {
        
        if (modalTitle.innerText === `Chat with ${data.sender_id}`) {
          if (data.message == "yes") {
            // use setTimeout to animate "." ".." "..." in the title
            const messages = [
              `${data.sender_id} is typing.`,
              `${data.sender_id} is typing..`,
              `${data.sender_id} is typing...`
            ];
            
            let messageIndex = 0;
            
            function displayNextMessage() {
              modalTitle.innerText = messages[messageIndex];
              messageIndex = (messageIndex + 1) % messages.length;
            }
            modalTitle.innerText = `${data.sender_id} is typing`
            typingTimer = setInterval(displayNextMessage, 500);
            console.log(typingTimer)
          }
        } else if (modalTitle.innerText.toString().includes(data.sender_id)) {
          if (data.message == "no") {
            console.log(typingTimer)
            //clear the timer
            clearInterval(typingTimer);
            
            modalTitle.innerText = `Chat with ${data.sender_id}`;
          }
        }
      }

    } else {
      console.log("message received");
      const message = sanitize(data.message);
      const from = data.sender_id;
      const timestamp = data.timestamp;
      // update last message timestamp in userlist for sorting
      updateLastMessageTimestamp(from, timestamp);
      const messageDiv = document.createElement("div");
      //change timestamp to time object with format like 3/23/2023, 1:00:35 PM
      let time = new Date(timestamp).toLocaleString();
      messageDiv.classList.add("message");
      messageDiv.innerHTML = `
    <p class="message-timestamp">${time}</p>
  <p class="message-from">${from}</p>
  <p class="message-content"> : ${message}</p>
`;

      const modal = document.getElementById("direct-message-modal");

      const modalTitle = document.getElementById("direct-message-modal-title");
      const modalChat = document.getElementById("direct-message-modal-chat");
      if (modal && modal.style.display === "block") {
        if (modalTitle.innerText.toString().includes(from)) {
          modalChat.appendChild(messageDiv);
          modalChat.scrollTop = modalChat.scrollHeight;
        } else {
          sortUsers(userlist);
          addUnreadMessage(from);
        }

      } else {
        sortUsers(userlist);
        addUnreadMessage(from);
        
      }
      
    }
  };
};

addUnreadMessage = (from) => {
  const userItems = document.getElementsByClassName("user-item");
  for (const item of userItems) {
    if (item.innerHTML === from) {
      // add emoji to user-item
      item.innerHTML = `${item.innerHTML} 📩`;
    }
  }
};

clearUnreadMessage = (from) => {
  if (from.includes("📩")) {
    // remove emoji from user-item
    const userItems = document.getElementsByClassName("user-item");
    for (var item of userItems) {
      if (item.innerHTML === from) {
        item.innerHTML = item.innerHTML.split(" ")[0];
      }
    }
    return from.split(" ")[0];
  } else {
    return from;
  }
};
