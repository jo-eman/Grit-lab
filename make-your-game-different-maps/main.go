package main

import (
	"encoding/json"
	"log"
	"net/http"
	"sort"
)

var highScore []map[string]interface{}

func main() {
	fs := http.FileServer(http.Dir(""))
	http.Handle("/", http.StripPrefix("/", fs))

	http.HandleFunc("/plays", getScoreBoard)
	http.HandleFunc("/addPlay", addToScoreBoard)
	log.Fatal(http.ListenAndServe(":8080", handleCORS()))
}

// handler for GET request to /plays
func getScoreBoard(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")

	//var plays []map[string]interface{}
	for index, _ := range highScore {
		highScore[index]["Rank"] = index + 1
	}

	json.NewEncoder(w).Encode(highScore)
}

// handler for POST request to /addPlay
func addToScoreBoard(w http.ResponseWriter, r *http.Request) {
	var play map[string]interface{}
	err := json.NewDecoder(r.Body).Decode(&play)
	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	highScore = append(highScore, play)
	sortByScore(highScore)

	//respond 200 ok
	w.WriteHeader(http.StatusOK)
}

func sortByScore(plays []map[string]interface{}) {
	sort.Slice(plays, func(i, j int) bool {
		return plays[i]["Score"].(float64) > plays[j]["Score"].(float64)
	})
}

// middleware to handle CORS
func handleCORS() http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Access-Control-Allow-Origin", "*")
		w.Header().Set("Access-Control-Allow-Methods", "POST, GET")
		w.Header().Set("Access-Control-Allow-Headers", "Accept, Content-Type, Content-Length, Accept-Encoding, Authorization")
		if r.Method == "OPTIONS" {
			w.WriteHeader(http.StatusNoContent)
			return
		}
		http.DefaultServeMux.ServeHTTP(w, r)

	})
}
