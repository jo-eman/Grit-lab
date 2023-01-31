package api

import (
	"encoding/json"
	"fmt"
	"io/ioutil"
	"net/http"
)

// STRUCT WITH ALL ELEMENTS FROM LOCATIONS API
type Relation struct {
	Index []struct {
		ID             int                 `json:"id"`
		DatesLocations map[string][]string `json:"datesLocations"`
	} `json:"index"`
}

var RelationApiContent Relation

// STORAGING THE CONTENT OF THE API INTO DatesApiContent Dates
func GetRelation() Relation {

	url := "https://groupietrackers.herokuapp.com/api/relation"

	resp, err := http.Get(url)

	if err != nil {
		fmt.Println(err)
	}

	defer resp.Body.Close()
	body, err := ioutil.ReadAll(resp.Body)
	if err != nil {
		fmt.Println(err)
	}

	if err := json.Unmarshal(body, &RelationApiContent); err != nil {
		fmt.Println(err)
	}

	return RelationApiContent
}
