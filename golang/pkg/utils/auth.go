package utils

import (
	"encoding/json"
	"errors"
	"net/http"
)

type User struct {
	UserID   uint   `json:"user_id"`
	Username string `json:"username"`
	Role     string `json:"role"`
	Email    string `json:"email"`
	Mobile   string `json:"mobile"`
}

func ValidateToken(cookies []*http.Cookie) (*User, error) {
	var jwtToken string

	// Find the `jwt` cookie
	for _, cookie := range cookies {
		if cookie.Name == "jwt" {
			jwtToken = cookie.Value
			break
		}
	}

	if jwtToken == "" {
		return nil, errors.New("unauthorized: no valid jwt cookie found")
	}

	client := &http.Client{}
	req, err := http.NewRequest("GET", "http://localhost:3000/users/validate_token", nil)
	if err != nil {
		return nil, err
	}

	req.AddCookie(&http.Cookie{Name: "jwt", Value: jwtToken}) // add the extracted cookie to request

	resp, err := client.Do(req) // the request is sent to authentication service
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return nil, errors.New("unauthorized") // if response recieved is not 200 , unauthorized
	}

	var user User
	if err := json.NewDecoder(resp.Body).Decode(&user); err != nil { // if authorized decode the json data into above USer struct
		return nil, err
	}

	return &user, nil
}
