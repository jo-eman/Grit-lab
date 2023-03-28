package sessions

import (
	"fmt"
	"net/http"
	"time"

	uuid "github.com/gofrs/uuid"
)

var Sessions = map[string]session{}

// each session contains the username of the user and the time at which it expires
type session struct {
	username string
	expiry   time.Time
}

// Checks if the session has expired
func (s session) isExpired() bool {
	return s.expiry.Before(time.Now())
}

func getIP(r *http.Request) string {
	forwarded := r.Header.Get("X-FORWARDED-FOR")
	if forwarded != "" {
		return forwarded
	}
	return r.RemoteAddr
}
func GetUsername(token string) string {
	return Sessions[token].username
}

// Execute this function when a submit with valid credentials is made on the Login page.
// Creates an UUID session token with an expiration date for the user.
func StartSesh(w http.ResponseWriter, r *http.Request, username string) {
	fmt.Println("Starting session for", username)
	// Delete any existing Sessions for this user
	for k, v := range Sessions {
		if v.username == username {
			delete(Sessions, k)
		}
	}
	// Create a new random session token
	// we use the "github.com/google/uuid" library to generate UUIDs
	sessionToken := uuid.Must(uuid.NewV4()).String()
	fmt.Println("Session token:", sessionToken)
	expiresAt := time.Now().Add(6000 * time.Second)

	// Set the token in the session map, along with the session information
	Sessions[sessionToken] = session{
		username: username,
		expiry:   expiresAt,
	}
	fmt.Println("User:token in the Sessions map: ", Sessions[sessionToken])

	// Set cookies for the user
	cookieUsername := http.Cookie{
		Name:    "username",
		Value:   username,
		Expires: expiresAt,
		Path:    "/",
	}

	cookieSession := http.Cookie{
		Name:    "session",
		Value:   sessionToken,
		Expires: expiresAt,
		Path:    "/",
	}

	http.SetCookie(w, &cookieUsername)
	http.SetCookie(w, &cookieSession)
}

func ValidateSession(w http.ResponseWriter, r *http.Request) bool {
	// Get the session token from the cookies or from the request headers
	cookie, err := r.Cookie("session")
	if err != nil {
		sessionToken := r.Header.Get("session-token")
		if sessionToken == "" {
			return false
		}
		cookie = &http.Cookie{Name: "session", Value: sessionToken}
	}
	// Check if the session token is present in the Sessions map and not expired
	s, ok := Sessions[cookie.Value]
	if !ok || s.isExpired() {
		return false
	}
	// If the session is valid, update its expiry time
	s.expiry = time.Now().Add(6000 * time.Second)
	Sessions[cookie.Value] = s
	return true
}
