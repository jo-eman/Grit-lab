package server

import (
	"fmt"
	"net/http"
	"text/template"
)

var errorLine string

func ErrorInternalServer(w http.ResponseWriter) {
	errorLine = "Error 500: Internal server error."
	w.WriteHeader(500)
	tmplt, err := template.ParseFiles("html/error.html")
	if err != nil {
		fmt.Println(err)
		return
	}
	err = tmplt.Execute(w, errorLine)
	if err != nil {
		fmt.Println(err)
		return
	}
}

func ErrorBadRequest(w http.ResponseWriter) {
	errorLine = "Error 400: Bad request."
	w.WriteHeader(400)
	tmplt, err := template.ParseFiles("html/error.html")
	if err != nil {
		fmt.Println(err)
		return
	}
	err = tmplt.Execute(w, errorLine)
	if err != nil {
		fmt.Println(err)
		return
	}
}

func ErrorNotFound(w http.ResponseWriter) {
	w.WriteHeader(404)
	errorLine = "Error 404: Page not found."
	tmplt, err := template.ParseFiles("html/error.html")
	if err != nil {
		fmt.Println(err)
		return
	}
	err = tmplt.Execute(w, errorLine)
	if err != nil {
		fmt.Println(err)
		return
	}
}
