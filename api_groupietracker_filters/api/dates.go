package api

import (
	"encoding/json"
	"fmt"
	"io/ioutil"
	"net/http"
)

// STRUCT WITH ALL ELEMENTS FROM LOCATIONS API
type Dates struct {
	Index []struct {
		ID    int      `json:"id"`
		Dates []string `json:"dates"`
	} `json:"index"`
}

var DatesApiContent Dates

// STORAGING THE CONTENT OF THE API INTO DatesApiContent Dates
func GetDates() Dates {

	url := "https://groupietrackers.herokuapp.com/api/dates"

	resp, err := http.Get(url)

	if err != nil {
		fmt.Println(err)
	}

	defer resp.Body.Close()
	body, err := ioutil.ReadAll(resp.Body)
	if err != nil {
		fmt.Println(err)
	}

	if err := json.Unmarshal(body, &DatesApiContent); err != nil {
		fmt.Println(err)
	}

	return DatesApiContent
}
