package models

import (
	"encoding/json"
	"errors"
	"time"

	"gorm.io/gorm"
)

type Book struct {
	BookID             uint      `gorm:"primaryKey" json:"book_id"`
	Title              string    `json:"title"`
	Author             string    `json:"author"`
	PublicationDate    time.Time `gorm:"type:date" json:"publication_date"`
	Genre              string    `json:"genre"`
	TotalCount         int       `json:"total_count"`
	BorrowedCount      int       `json:"borrowed_count"`
	AvailabilityStatus bool      `json:"availability_status"`
}

type BorrowBook struct {
	gorm.Model
	BookID     uint       `json:"book_id"`
	Book       Book       `json:"book"`
	Username   string     `json:"username"`
	Email      string     `json:"email"`
	Mobile     string     `json:"mobile"`
	BorrowedOn time.Time  `gorm:"type:date" json:"borrowed_on"`
	ReturnedOn *time.Time `gorm:"type:date" json:"returned_on,omitempty"`
}

// JSON Serialization and Deserialization(JSON encoding and decoding of Alias does not invoke overriden method again)
// frontend gives dd/mm/yyyy format now we unmarshall and convert that format to time.Time object to backend
func (b *Book) UnmarshalJSON(data []byte) error {
	type Alias Book  //to avoid infinite recursion when calling UnmarshalJSON by creating anonymous struct inside UnmarshalJSON method
	aux := &struct { //temporarily holds the incoming JSON data
		PublicationDate string `json:"publication_date"` // making publication date as string
		*Alias
	}{
		Alias: (*Alias)(b), // adding remaining book fields , creates an instance 'b' of struct 'Alias'
	}

	if err := json.Unmarshal(data, &aux); err != nil {
		return err
	}

	// Parse the publication_date in "dd/mm/yyyy" format
	if aux.PublicationDate != "" {
		parsedDate, err := time.Parse("02/01/2006", aux.PublicationDate) // converts dd/mm/yyyy into time.Time format of golang
		if err != nil {
			return errors.New("invalid date format for publication_date, expected dd/mm/yyyy")
		}
		b.PublicationDate = parsedDate //assign the converted publication date
	}

	return nil
}

// backend gives time.Time object now we marshall and convert it into dd/mm/yyyy format and give to frontend
func (b Book) MarshalJSON() ([]byte, error) {
	type Alias Book //to avoid infinite recursion when calling MarshalJSON
	return json.Marshal(&struct {
		PublicationDate string `json:"publication_date"` //making publication date as string
		*Alias
	}{
		PublicationDate: b.PublicationDate.Format("02/01/2006"), //convert time.Time format to dd/mm/yyyy format to frontend
		Alias:           (*Alias)(&b),
	})
}
