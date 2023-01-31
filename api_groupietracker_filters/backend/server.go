package server

import (
	"fmt"
	"groupie-tracker/api"
	"net/http"
	"strconv"
	"text/template"
)

var (
	Artists   = api.GetArtists()
	Locations = api.GetLocations()
	Dates     = api.GetDates()
	Relation  = api.GetRelation()
	tmplt     *template.Template
	Band      api.AllBandData
)

func RunServer() {
	fs := http.FileServer(http.Dir("html/"))
	http.Handle("/src/", http.StripPrefix("/src/", fs))
	http.HandleFunc("/", handlePage)
	http.HandleFunc("/artist", handleArtist)
	fmt.Println("Server running in http://localhost:8080")
	err := http.ListenAndServe("localhost:8080", nil)
	if err != nil {
		fmt.Println("There's an error with the server:", err)
	}
}

func handlePage(writer http.ResponseWriter, request *http.Request) {
	var err error
	if request.Method == "GET" && request.URL.Path == "/" {
		tmplt, err = template.ParseFiles("html/index.html")
		if err != nil {
			ErrorInternalServer(writer)
			return
		}
		err = tmplt.Execute(writer, Artists)
		if err != nil {
			fmt.Println(err)
			fmt.Println("could not exec")
			return
		}
	} else {
		ErrorNotFound(writer)
		return
	}
}

func handleArtist(writer http.ResponseWriter, request *http.Request) {
	id := request.URL.Query().Get("id")
	idInt, err := strconv.Atoi(id)
	if err != nil {
		ErrorNotFound(writer)
		return
	}
	if idInt < 1 || idInt > api.MaxID {
		ErrorNotFound(writer)
		return
	}

	Band = api.PrepareBand(idInt)
	api.GetRelation()

	if request.Method == "GET" {
		tmplt = template.Must(template.ParseFiles("html/artist.html"))
		err := tmplt.Execute(writer, Band)
		if err != nil {
			fmt.Println(err)
			return
		}
	}

}
