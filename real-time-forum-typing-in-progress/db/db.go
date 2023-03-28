package db

import (
	"database/sql"
	"log"

	//import sqlite3 driver
	_ "github.com/mattn/go-sqlite3"
)

var Db *sql.DB

func init() {
	var err error
	Db, err = sql.Open("sqlite3", "./users.db")
	if err != nil {
		log.Fatal(err)
	}

	_, err = Db.Exec(`CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT NOT NULL UNIQUE,
        realname TEXT NOT NULL,
        gender TEXT NOT NULL,
		age TEXT NOT NULL,
        email TEXT NOT NULL UNIQUE,
        password TEXT NOT NULL
    )`)
	if err != nil {
		log.Fatal(err)
	}

	_, err = Db.Exec(`CREATE TABLE IF NOT EXISTS posts (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        content TEXT NOT NULL,
		tags TEXT NOT NULL,
		author TEXT NOT NULL
    )`)
	if err != nil {
		log.Fatal(err)
	}
	// create comments table with post_id, username, content, timestamp
	_, err = Db.Exec(`CREATE TABLE IF NOT EXISTS comments (
		id INTEGER PRIMARY KEY AUTOINCREMENT,
		post_id INTEGER NOT NULL,
		username TEXT NOT NULL,
		content TEXT NOT NULL,
		timestamp TEXT NOT NULL
	)`)

	_, err = Db.Exec(`CREATE TABLE IF NOT EXISTS messages (
		id INTEGER PRIMARY KEY AUTOINCREMENT,
		sender_id TEXT,
		receiver_id TEXT,
		content TEXT,
		timestamp INTEGER
	)`)

}
