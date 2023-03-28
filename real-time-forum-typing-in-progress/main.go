package main

import (
	"log"
	"net/http"

	_ "realtimeforum/db"
	h "realtimeforum/handlers"

	_ "github.com/mattn/go-sqlite3"
)

func main() {
	http.HandleFunc("/api/users/register", h.RegisterHandler)
	http.HandleFunc("/api/users/login", h.LoginHandler)
	http.HandleFunc("/api/users/list", h.UserListHandler)
	http.Handle("/css/", http.StripPrefix("/css/", http.FileServer(http.Dir("./css"))))
	http.Handle("/js/", http.StripPrefix("/js/", http.FileServer(http.Dir("./js"))))
	http.HandleFunc("/api/createpost", h.CreatePost)
	http.HandleFunc("/api/posts", h.GetPosts)
	http.HandleFunc("/api/createcomment", h.CreateComment)
	http.HandleFunc("/api/messages", h.GetMessages)
	http.HandleFunc("/", h.IndexHandler)
	http.HandleFunc("/ws", h.WsHandler)

	log.Println("Server started on localhost:8000")
	err := http.ListenAndServe(":8000", nil)
	if err != nil {
		log.Fatal("ListenAndServe: ", err)
	}
}
