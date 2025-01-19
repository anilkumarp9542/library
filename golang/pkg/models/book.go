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

// UnmarshalJSON parses the date in dd/mm/yyyy format from the frontend and converts it to time.Time
func (b *Book) UnmarshalJSON(data []byte) error {
	type Alias Book
	aux := &struct {
		PublicationDate string `json:"publication_date"`
		*Alias
	}{
		Alias: (*Alias)(b),
	}

	if err := json.Unmarshal(data, &aux); err != nil {
		return err
	}

	// Parse the publication_date in "dd/mm/yyyy" format
	if aux.PublicationDate != "" {
		parsedDate, err := time.Parse("02/01/2006", aux.PublicationDate)
		if err != nil {
			return errors.New("invalid date format for publication_date, expected dd/mm/yyyy")
		}
		b.PublicationDate = parsedDate
	}

	return nil
}

// MarshalJSON formats the date to dd/mm/yyyy for JSON responses
func (b Book) MarshalJSON() ([]byte, error) {
	type Alias Book
	return json.Marshal(&struct {
		PublicationDate string `json:"publication_date"`
		*Alias
	}{
		PublicationDate: b.PublicationDate.Format("02/01/2006"),
		Alias:           (*Alias)(&b),
	})
}
