package api

import (
	"encoding/json"
	"fmt"
	"io/ioutil"
	"net/http"
	"strings"
)

// STRUCT WITH ALL ELEMENTS FROM ARTISTS API

type Artist struct {
	ID             int      `json:"id"`
	Image          string   `json:"image"`
	Name           string   `json:"name"`
	Members        []string `json:"members"`
	CreationDate   int      `json:"creationDate"`
	FirstAlbum     string   `json:"firstAlbum"`
	Locations      string   `json:"locations"`
	ConcertDates   string   `json:"concertDates"`
	Relations      string   `json:"relations"`
	FirstAlbumYear string
	OnlyLocations  []string `json:"onlyLocations"`
	Countries      []string `json:"countries"`
	AllCountries   []Country
}

var ArtistsApiContent []Artist

var MaxID int

// STORAGING THE CONTENT OF THE API INTO ARTISTS []ARTISTS
func GetArtists() []Artist {

	url := "https://groupietrackers.herokuapp.com/api/artists"

	resp, err := http.Get(url)

	if err != nil {
		fmt.Println(err)
	}

	defer resp.Body.Close()
	body, err := ioutil.ReadAll(resp.Body)
	if err != nil {
		fmt.Println(err)
	}

	if err := json.Unmarshal(body, &ArtistsApiContent); err != nil {
		fmt.Println(err)
	}
	MaxID = len(ArtistsApiContent)

	FormatMembers(ArtistsApiContent)
	ArtistsApiContent = FirstAlbumDateToYear()

	ArtistsApiContent = FormatLocations()

	for i := range ArtistsApiContent {
		ArtistsApiContent[i].AllCountries = ParseLocs()
	}

	return ArtistsApiContent
}

func FormatMembers([]Artist) []Artist {
	for i := 0; i < len(ArtistsApiContent); i++ {
		for j := 0; j < len(ArtistsApiContent[i].Members); j++ {
			ArtistsApiContent[i].Members[j] = strings.TrimSpace(ArtistsApiContent[i].Members[j])
		}
	}

	return ArtistsApiContent
}

func FirstAlbumDateToYear() []Artist {
	for i := 0; i < len(ArtistsApiContent); i++ {
		ArtistsApiContent[i].FirstAlbumYear = ArtistsApiContent[i].FirstAlbum[6:10]
	}

	return ArtistsApiContent
}

// append keys from Band.DatesLocations to ArtistApiConten[i].OnlyLocations
func FormatLocations() []Artist {

	for i := 0; i < len(ArtistsApiContent); i++ {
		//fmt.Println(ArtistsApiContent)
		Relations := GetRelation()

		for k := range Relations.Index[i].DatesLocations {

			ArtistsApiContent[i].OnlyLocations = append(ArtistsApiContent[i].OnlyLocations, k)
			//fmt.Println(k)
		}
	}

	return ArtistsApiContent

}
