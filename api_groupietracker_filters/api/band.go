package api

type AllBandData struct {
	ID             int
	Image          string
	Name           string
	Members        []string
	CreationDate   int
	FirstAlbum     string
	FirstAlbumYear string
	Locations      []string
	Dates          []string
	DatesLocations map[string][]string
	OnlyLocations  []string
}

var Band AllBandData

func PrepareBand(idInt int) AllBandData {
	Band.ID = idInt
	Band.Name = ArtistsApiContent[idInt-1].Name
	Band.Image = ArtistsApiContent[idInt-1].Image
	Band.Members = ArtistsApiContent[idInt-1].Members
	Band.CreationDate = ArtistsApiContent[idInt-1].CreationDate
	Band.FirstAlbum = ArtistsApiContent[idInt-1].FirstAlbum
	Band.FirstAlbumYear = string(Band.FirstAlbum[0:1])
	Band.Locations = LocationsApiContent.Index[idInt-1].Locations
	Band.Dates = DatesApiContent.Index[idInt-1].Dates
	Band.DatesLocations = RelationApiContent.Index[idInt-1].DatesLocations

	for location := range Band.DatesLocations {

		Band.OnlyLocations = append(Band.OnlyLocations, location)

	}
	return Band
}
