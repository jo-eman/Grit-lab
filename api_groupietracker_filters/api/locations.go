package api

import (
	"encoding/json"
	"fmt"
	"io/ioutil"
	"net/http"
	"strings"
)

// STRUCT WITH ALL ELEMENTS FROM LOCATIONS API
type Locations struct {
	Index []struct {
		ID        int      `json:"id"`
		Locations []string `json:"locations"`
		Dates     string   `json:"dates"`
	} `json:"index"`
}

type Country struct {
	Name   string
	States []State
	Cities []string
}
type State struct {
	Name   string
	Cities []string
}

var AllCountries []Country
var allLocs []string

var LocationsApiContent Locations

//Parse locs
func ParseLocs() []Country {
	//Store raw content
	for _, a := range LocationsApiContent.Index {
		allLocs = append(allLocs, a.Locations...)
	}

	//Remove duplicates
	for i, a := range allLocs {
		for j := i; j < len(allLocs); j++ {
			if allLocs[j] == a {
				if j != len(allLocs)-1 {
					allLocs = append(allLocs[:j], allLocs[j+1:]...)
				} else {
					allLocs = allLocs[:j]
				}
			}
		}
	}

	//**StRuCtUrIsE**
	for _, a := range allLocs {
		countryexists := false
		cityexists := false
		for j, b := range AllCountries {
			if b.Name == strings.Split(a, "-")[0] {
				countryexists = true
				for _, c := range b.Cities {
					if c == strings.Split(a, "-")[1] {
						cityexists = true
					}
				}
				if !cityexists {
					AllCountries[j].Cities = append(AllCountries[j].Cities, strings.Split(a, "-")[1])
				}
			}
		}
		if !countryexists {
			var temp Country
			temp.Name = strings.Split(a, "-")[0]
			temp.Cities = append(temp.Cities, strings.Split(a, "-")[1])
			AllCountries = append(AllCountries, temp)
		}
	}

	return AllCountries
}

// STORAGING THE CONTENT OF THE API INTO LocationsApiContent Locations
func GetLocations() Locations {

	url := "https://groupietrackers.herokuapp.com/api/locations"

	resp, err := http.Get(url)

	if err != nil {
		fmt.Println(err)
	}

	defer resp.Body.Close()
	body, err := ioutil.ReadAll(resp.Body)
	if err != nil {
		fmt.Println(err)
	}

	if err := json.Unmarshal(body, &LocationsApiContent); err != nil {
		fmt.Println(err)
	}

	return LocationsApiContent
}
