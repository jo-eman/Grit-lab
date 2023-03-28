package handlers

import (
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	_ "realtimeforum/db"
	db "realtimeforum/db"
	ses "realtimeforum/sessions"
	"sync"
	"time"

	"github.com/gorilla/websocket"
)

var (
	activeSessions    map[string]bool
	Key               []byte
	activeConnections = make(map[*websocket.Conn]string)
)

type User struct {
	ID         string `json:"id"`
	Username   string `json:"username"`
	Realname   string `json:"realname"`
	Gender     string `json:"gender"`
	Age        string `json:"age"`
	Email      string `json:"email"`
	Password   string `json:"password"`
	Credential string `json:"credential"`
}

type Response struct {
	Success bool   `json:"success"`
	Message string `json:"message"`
	Token   string `json:"token,omitempty"`
}

type Post struct {
	ID       int       `json:"id"`
	Title    string    `json:"title"`
	Content  string    `json:"content"`
	Tags     string    `json:"tags"`
	Comments []Comment `json:"comments"`
	Author   string    `json:"author"`
}

func RegisterHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method != "POST" {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	var user User
	err := json.NewDecoder(r.Body).Decode(&user)
	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	_, err = db.Db.Exec("INSERT INTO users (username, realname, gender, age, email, password) VALUES (?, ?, ?, ?, ?, ?)",
		user.Username, user.Realname, user.Gender, user.Age, user.Email, user.Password)
	if err != nil {
		fmt.Println("Error inserting user into database")
		http.Error(w, err.Error(), http.StatusInternalServerError)
		fmt.Println(err)
		return
	}

	ses.StartSesh(w, r, user.Username)

	response := Response{
		Success: true,
		Message: "User registered and logged in successfully",
		Token:   "token",
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(response)
}

func LoginHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method != "POST" {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}
	var user User
	err := json.NewDecoder(r.Body).Decode(&user)
	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	var dbUser User
	err = db.Db.QueryRow("SELECT * FROM users WHERE email = ? OR username = ?", user.Credential, user.Credential).Scan(&dbUser.ID, &dbUser.Username, &dbUser.Realname, &dbUser.Gender, &dbUser.Age, &dbUser.Email, &dbUser.Password)
	fmt.Println("information of the requested account:", dbUser)
	if err != nil {
		fmt.Println("Error populating user struct, user doesn't exist")
		http.Error(w, "Incorrect user", http.StatusUnauthorized)
		return
	}
	// Check if password is correct
	if user.Password != dbUser.Password {
		fmt.Println("Incorrect password")
		http.Error(w, "Incorrect password", http.StatusUnauthorized)
		return
	}

	ses.StartSesh(w, r, dbUser.Username)

	response := Response{
		Success: true,
		Message: "User logged in successfully",
		Token:   "token",
	}
	w.Header().Set("Content-Type", "application/json")
	err = json.NewEncoder(w).Encode(response)
	if err != nil {
		log.Println(err)
	}
}

type Chatuser struct {
	Username        string `json:"username"`
	LastMessageTime string `json:"last_message_time"`
}

// Handler for retrieving a list of chat users
func UserListHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method != "GET" {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	// get the username from the session
	cookie, err := r.Cookie("session")
	if err != nil {
		log.Println(err)
		return
	}

	token := cookie.Value

	// Get the sender ID from the session token
	senderID := ses.GetUsername(token)
	fmt.Println("chatlist request senderID:", senderID)

	// get all usernames from the database
	rows, err := db.Db.Query("SELECT username FROM users")

	var usernames []string
	for rows.Next() {
		var username string
		if err := rows.Scan(&username); err != nil {
			log.Println(err)
			continue
		}
		usernames = append(usernames, username)
	}
	var users []Chatuser
	for _, username := range usernames {
		// get the last message with latest timestamp from table named senderID_username
		var lastMessageTime string
		err = db.Db.QueryRow("SELECT timestamp FROM " + senderID + "_" + username + " ORDER BY timestamp DESC LIMIT 1").Scan(&lastMessageTime)
		if err != nil {
			log.Println(err)
			//continue
		}
		// insert the username and the last message time into the chatusers slice
		users = append(users, Chatuser{
			Username:        username,
			LastMessageTime: lastMessageTime,
		})
	}

	fmt.Println("users:", users)

	w.Header().Set("Content-Type", "application/json")
	err = json.NewEncoder(w).Encode(users)
	if err != nil {
		log.Println(err)
	}
}

func CreatePost(w http.ResponseWriter, r *http.Request) {
	if r.Method != "POST" {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	var post Post
	err := json.NewDecoder(r.Body).Decode(&post)
	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}
	//check if post.Author exists in Sessions
	currentuser := ses.GetUsername(post.Author)
	fmt.Println("currentuser:", currentuser)
	if currentuser == "" {
		http.Error(w, "User not logged in", http.StatusUnauthorized)
		return
	}

	_, err = db.Db.Exec("INSERT INTO posts (title, content, tags, author) VALUES (?, ?, ?, ?)",
		post.Title, post.Content, post.Tags, currentuser)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusCreated)
}

func GetPosts(w http.ResponseWriter, r *http.Request) {
	if r.Method != "GET" {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	rows, err := db.Db.Query("SELECT * FROM posts")
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	defer rows.Close()

	var posts []Post
	for rows.Next() {
		var post Post
		err := rows.Scan(&post.ID, &post.Title, &post.Content, &post.Tags, &post.Author)
		if err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}

		// Get comments for this post
		commentRows, err := db.Db.Query("SELECT * FROM comments WHERE post_id = ?", post.ID)
		if err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}
		defer commentRows.Close()

		var comments []Comment

		for commentRows.Next() {
			var comment Comment
			err := commentRows.Scan(&comment.ID, &comment.PostID, &comment.Username, &comment.Content, &comment.Timestamp)
			if err != nil {
				http.Error(w, err.Error(), http.StatusInternalServerError)
				return
			}
			comments = append(comments, comment)
		}

		post.Comments = comments
		posts = append(posts, post)
	}

	w.Header().Set("Content-Type", "application/json")
	err = json.NewEncoder(w).Encode(posts)
	if err != nil {
		log.Println(err)
	}
}

func IndexHandler(w http.ResponseWriter, r *http.Request) {
	if r.URL.Path != "/" {
		http.NotFound(w, r)
		return
	}

	if r.Method != "GET" {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	if !ses.ValidateSession(w, r) {
		fmt.Println("session not valid")
		//delete users cookie
		cookie := http.Cookie{
			Name:   "session",
			Value:  "",
			MaxAge: -1,
		}

		http.SetCookie(w, &cookie)

		//delete username cookie
		cookie = http.Cookie{
			Name:   "username",
			Value:  "",
			MaxAge: -1,
		}

		http.SetCookie(w, &cookie)

		//set isLoggedin to false in Local Storage

	}

	http.ServeFile(w, r, "index.html")

}

type Comment struct {
	ID        int    `json:"id"`
	PostID    int    `json:"post_id"`
	Username  string `json:"username"`
	Content   string `json:"content"`
	Timestamp string `json:"timestamp"`
}

func CreateComment(w http.ResponseWriter, r *http.Request) {
	if r.Method != "POST" {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}
	var comment Comment
	err := json.NewDecoder(r.Body).Decode(&comment)
	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	fmt.Println("comment:", comment)

	currentuser := ses.GetUsername(comment.Username) //username is actually token :D
	fmt.Println("currentuser:", currentuser)
	if currentuser == "" {
		http.Error(w, "User not logged in", http.StatusUnauthorized)
		return
	}

	_, err = db.Db.Exec("INSERT INTO comments (post_id, username, content, timestamp) VALUES (?, ?, ?, ?)",
		comment.PostID, currentuser, comment.Content, comment.Timestamp)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(comment)
}

type Message struct {
	SenderID   string `json:"sender_id"`
	ReceiverID string `json:"receiver_id"`
	Message    string `json:"message"`
	Timestamp  string `json:"timestamp"`
	Type       string `json:"type"`
}

type MessageHistory struct {
	Messages []Message `json:"messages"`
	mux      sync.Mutex
}

var messageHistory MessageHistory

func addMessageToHistory(msg Message) {
	messageHistory.mux.Lock()
	messageHistory.Messages = append(messageHistory.Messages, msg)
	messageHistory.mux.Unlock()
}

func addMessageToDB(msg Message) error {
	sender := msg.SenderID
	receiver := msg.ReceiverID
	msgtxt := msg.Message
	timestamp := msg.Timestamp
	conversation := sender + "_" + receiver
	conversation2 := receiver + "_" + sender

	// create a table for the conversation and conversation2 if they don't exist
	// and populate the tables with sender, msgtxt, timestamp
	// if the conversation tables exist, insert into them

	_, err := db.Db.Exec("CREATE TABLE IF NOT EXISTS " + conversation + " (sender TEXT NOT NULL, msgtxt TEXT NOT NULL, timestamp TEXT NOT NULL)")
	if err != nil {
		return err
	}

	_, err = db.Db.Exec("CREATE TABLE IF NOT EXISTS " + conversation2 + " (sender TEXT NOT NULL, msgtxt TEXT NOT NULL, timestamp TEXT NOT NULL)")
	if err != nil {
		return err
	}

	_, err = db.Db.Exec("INSERT INTO "+conversation+" (sender, msgtxt, timestamp) VALUES (?, ?, ?)", sender, msgtxt, timestamp)
	if err != nil {
		return err
	}

	_, err = db.Db.Exec("INSERT INTO "+conversation2+" (sender, msgtxt, timestamp) VALUES (?, ?, ?)", sender, msgtxt, timestamp)
	if err != nil {
		return err
	}

	return nil
}

// upgrader function
var upgrader = websocket.Upgrader{
	ReadBufferSize:  1024,
	WriteBufferSize: 1024,
	CheckOrigin: func(r *http.Request) bool {
		return true
	},
}

func WsHandler(w http.ResponseWriter, r *http.Request) {
	// Upgrade the HTTP connection to a WebSocket connection
	conn, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		log.Println(err)
		return
	}

	defer conn.Close()

	cookie, err := r.Cookie("session")
	if err != nil {
		log.Println(err)
		return
	}

	token := cookie.Value

	// Get the sender ID from the session token
	senderID := ses.GetUsername(token)
	fmt.Println("Sender ID: " + senderID)

	// check if senderID is in activeConnections
	for _, v := range activeConnections {
		if v == senderID {
			log.Println("User already logged in")
			// change to the new connection
			activeConnections[conn] = senderID
		}
	}
	// Add the connection to the active connections map
	activeConnections[conn] = senderID

	notifyOnlineUsers()

	// Channel to receive messages from the WebSocket connection
	msgCh := make(chan Message)

	// Routine to read messages from the WebSocket connection and send them to the channel
	go func() {

		defer func() {
			delete(activeConnections, conn)
			notifyOnlineUsers()
			fmt.Println("Connection closed, socket is kill")
		}()

		for {
			// Read a message from the WebSocket connection
			_, message, err := conn.ReadMessage()
			if err != nil {
				log.Println(err)

				return
			}
			fmt.Println("Message received: " + string(message))
			// Get the sender ID from the the message JSON and add it to the active connections map

			// Get the receiver's ID from the message JSON
			var msg map[string]string
			err = json.Unmarshal(message, &msg)
			if err != nil {
				log.Println(err)
				continue
			}
			msgType := msg["type"]
			receiverID := msg["to"]
			senderID := activeConnections[conn]
			msgtxt := msg["message"]
			timestamp := time.Now().Format("2006-01-02 15:04:05")
			//activeConnections[conn] = senderID

			// Send the message to the channel
			msgCh <- Message{SenderID: senderID, ReceiverID: receiverID, Message: msgtxt, Timestamp: timestamp, Type: msgType}
		}
	}()

	// Loop to handle messages received from the channel
	for msg := range msgCh {
		// Find the receiver's WebSocket connection in the active connections map
		var receiverConn *websocket.Conn
		for conn := range activeConnections {
			if activeConnections[conn] == msg.ReceiverID {
				receiverConn = conn
				break
			}
		}

		// If the receiver's WebSocket connection was found, send the message to the receiver and insert into the database
		if receiverConn != nil {
			data, err := json.Marshal(msg)
			err = receiverConn.WriteMessage(websocket.TextMessage, []byte(data))
			if err != nil {
				log.Println(err)
				delete(activeConnections, receiverConn)

			} else {
				if msg.Type != "isTyping" {
					addMessageToHistory(msg)
					err = addMessageToDB(msg)
					if err != nil {
						log.Println(err)
					}
				}
			}

		} else {
			// If the receiver's WebSocket connection was not found, add the message to the message history
			if msg.Type != "isTyping" {
				addMessageToHistory(msg)

				fmt.Println("firing")
				err = addMessageToDB(msg)
				if err != nil {
					log.Println(err)
				}
			}
		}
	}
}

func notifyOnlineUsers() {
	// Get the current list of online users from the activeConnections map
	onlineUsers := make([]string, 0, len(activeConnections))
	for _, username := range activeConnections {
		onlineUsers = append(onlineUsers, username)
	}

	// Create a message containing the list of online users
	message := make(map[string]interface{})
	message["type"] = "onlineUsers"
	message["data"] = onlineUsers

	// Send the message to all connected clients
	for conn := range activeConnections {
		err := conn.WriteJSON(message)
		if err != nil {
			log.Println(err)
			conn.Close()
			delete(activeConnections, conn)
			notifyOnlineUsers()

		}
	}
}

func GetMessages(w http.ResponseWriter, r *http.Request) {
	// Get the sender ID from the session token
	cookie, err := r.Cookie("session")
	if err != nil {
		log.Println(err)
		return
	}

	token := cookie.Value

	senderID := ses.GetUsername(token)
	fmt.Println("Sender ID: " + senderID)

	// Get the receiver ID from the query string
	receiverID := r.URL.Query().Get("receiver_id")
	fmt.Println("Receiver ID: " + receiverID)

	//verify that receiverID is in the database
	userExist := false
	rows, err := db.Db.Query("SELECT username FROM users")
	if err != nil {
		log.Println(err)
		return
	}
	defer rows.Close()

	for rows.Next() {
		var username string
		err = rows.Scan(&username)
		if err != nil {
			log.Println(err)
			return
		}
		if username == receiverID {
			userExist = true
		}
	}

	if !userExist {
		log.Println("User you are trying to get message history for does not exist")
		return
	}

	// Get the messages from the database
	conversation := senderID + "_" + receiverID

	// check if it exists
	_, err = db.Db.Exec("CREATE TABLE IF NOT EXISTS " + conversation + " (sender TEXT NOT NULL, msgtxt TEXT NOT NULL, timestamp TEXT NOT NULL)")
	if err != nil {
		log.Println(err)
		return
	}

	rows, err = db.Db.Query("SELECT * FROM " + conversation)
	if err != nil {
		log.Println(err)
		return
	}
	defer rows.Close()

	var messages []Message
	for rows.Next() {
		var msg Message
		err = rows.Scan(&msg.SenderID, &msg.Message, &msg.Timestamp)
		if err != nil {
			log.Println(err)
			return
		}
		messages = append(messages, msg)
	}

	// Send the messages to the client
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(messages)
}
