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

	// Attach the cookie to the request
	req.AddCookie(&http.Cookie{Name: "jwt", Value: jwtToken})

	resp, err := client.Do(req)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return nil, errors.New("unauthorized")
	}

	var user User
	if err := json.NewDecoder(resp.Body).Decode(&user); err != nil {
		return nil, err
	}

	return &user, nil
}
