package controllers

import (
	"encoding/json"
	"golang/pkg/models"
	"golang/pkg/utils"
	"net/http"
	"strconv"
	"time"

	"github.com/gorilla/mux"
	"gorm.io/gorm"
)

type BookController struct {
	DB *gorm.DB
}

func NewBookController(db *gorm.DB) *BookController {
	return &BookController{DB: db}
}

// CreateBook - Admin and Librarian
func (c *BookController) CreateBook(w http.ResponseWriter, r *http.Request) {
	user, err := utils.ValidateToken(r.Cookies())
	if err != nil || (user.Role != "Admin" && user.Role != "Librarian") {
		http.Error(w, "Unauthorized", http.StatusUnauthorized)
		return
	}

	var book models.Book
	if err := json.NewDecoder(r.Body).Decode(&book); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	if book.TotalCount < 0 {
		http.Error(w, "Total count cannot be negative", http.StatusBadRequest)
		return
	}

	book.AvailabilityStatus = book.TotalCount > 0
	book.BorrowedCount = 0

	if err := c.DB.Create(&book).Error; err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(book)
}

// UpdateBook - Admin and Librarian
func (c *BookController) UpdateBook(w http.ResponseWriter, r *http.Request) {
	user, err := utils.ValidateToken(r.Cookies())
	if err != nil || (user.Role != "Admin" && user.Role != "Librarian") {
		http.Error(w, "Unauthorized", http.StatusUnauthorized)
		return
	}

	vars := mux.Vars(r)
	bookID, err := strconv.ParseUint(vars["id"], 10, 32)
	if err != nil {
		http.Error(w, "Invalid book ID", http.StatusBadRequest)
		return
	}

	var book models.Book
	if err := c.DB.First(&book, bookID).Error; err != nil {
		http.Error(w, "Book not found", http.StatusNotFound)
		return
	}

	var updateData models.Book
	if err := json.NewDecoder(r.Body).Decode(&updateData); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	if updateData.Title != "" {
		book.Title = updateData.Title
	}
	if updateData.Author != "" {
		book.Author = updateData.Author
	}
	if updateData.Genre != "" {
		book.Genre = updateData.Genre
	}
	if !updateData.PublicationDate.IsZero() {
		book.PublicationDate = updateData.PublicationDate
	}

	if updateData.TotalCount != 0 {
		if updateData.TotalCount < book.BorrowedCount {
			http.Error(w, "Total count cannot be less than borrowed count", http.StatusBadRequest)
			return
		}
		book.TotalCount = updateData.TotalCount
		book.AvailabilityStatus = book.TotalCount > book.BorrowedCount
	}

	if err := c.DB.Save(&book).Error; err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(book)
}

// DeleteBook - Admin and Librarian
func (c *BookController) DeleteBook(w http.ResponseWriter, r *http.Request) {
	user, err := utils.ValidateToken(r.Cookies())
	if err != nil || (user.Role != "Admin" && user.Role != "Librarian") {
		http.Error(w, "Unauthorized", http.StatusUnauthorized)
		return
	}

	vars := mux.Vars(r)
	bookID, err := strconv.ParseUint(vars["id"], 10, 32)
	if err != nil {
		http.Error(w, "Invalid book ID", http.StatusBadRequest)
		return
	}

	var book models.Book
	if err := c.DB.First(&book, bookID).Error; err != nil {
		http.Error(w, "Book not found", http.StatusNotFound)
		return
	}

	var activeBorrows int64
	c.DB.Model(&models.BorrowBook{}).Where("book_id = ? AND returned_on IS NULL", bookID).Count(&activeBorrows)
	if activeBorrows > 0 {
		http.Error(w, "Cannot delete book with active borrows", http.StatusBadRequest)
		return
	}

	if err := c.DB.Delete(&book).Error; err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(map[string]string{"message": "Book deleted successfully"})
}

// GetBookbyId - All Users
func (c *BookController) GetBookbyId(w http.ResponseWriter, r *http.Request) {
	_, err := utils.ValidateToken(r.Cookies())
	if err != nil {
		http.Error(w, "Unauthorized", http.StatusUnauthorized)
		return
	}

	vars := mux.Vars(r)
	bookID, err := strconv.ParseUint(vars["id"], 10, 32)
	if err != nil {
		http.Error(w, "Invalid book ID", http.StatusBadRequest)
		return
	}

	var book models.Book
	if err := c.DB.First(&book, bookID).Error; err != nil {
		http.Error(w, "Book not found", http.StatusNotFound)
		return
	}

	json.NewEncoder(w).Encode(book)
}

// GetBookbyTitle - All Users
func (c *BookController) GetBookbyTitle(w http.ResponseWriter, r *http.Request) {
	_, err := utils.ValidateToken(r.Cookies())
	if err != nil {
		http.Error(w, "Unauthorized", http.StatusUnauthorized)
		return
	}

	vars := mux.Vars(r)
	title := vars["title"]

	var book models.Book
	if err := c.DB.Where("title = ?", title).First(&book).Error; err != nil {
		http.Error(w, "Book not found", http.StatusNotFound)
		return
	}

	json.NewEncoder(w).Encode(book)
}

// GetAllBooks - All Users with Pagination and Search
func (c *BookController) GetAllBooks(w http.ResponseWriter, r *http.Request) {
	_, err := utils.ValidateToken(r.Cookies())
	if err != nil {
		http.Error(w, "Unauthorized", http.StatusUnauthorized)
		return
	}

	// Parse query parameters
	queryParams := r.URL.Query()
	pageStr := queryParams.Get("page")
	limitStr := queryParams.Get("limit")
	search := queryParams.Get("search")

	// Default values for pagination
	page, _ := strconv.Atoi(pageStr)
	if page < 1 {
		page = 1
	}

	limit, _ := strconv.Atoi(limitStr)
	if limit < 1 {
		limit = 10
	}

	offset := (page - 1) * limit

	// Base query
	query := c.DB.Model(&models.Book{})
	if search != "" {
		searchPattern := "%" + search + "%"
		query = query.Where("book_id LIKE ? OR title LIKE ? OR author LIKE ? OR genre LIKE ? ", searchPattern, searchPattern, searchPattern, searchPattern)
	}

	// Get total count
	var totalRecords int64
	if err := query.Count(&totalRecords).Error; err != nil {
		http.Error(w, "Failed to count books", http.StatusInternalServerError)
		return
	}

	// Get paginated books
	var books []models.Book
	if err := query.Order("book_id").Limit(limit).Offset(offset).Find(&books).Error; err != nil {
		http.Error(w, "Failed to fetch books", http.StatusInternalServerError)
		return
	}

	// Prepare response
	response := struct {
		Books []models.Book `json:"books"`
		Total int64         `json:"total"`
	}{
		Books: books,
		Total: totalRecords,
	}

	// Send JSON response
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(response)
}

// BorrowBook - Members Only
func (c *BookController) BorrowBook(w http.ResponseWriter, r *http.Request) {
	user, err := utils.ValidateToken(r.Cookies())
	if err != nil || user.Role != "Member" {
		http.Error(w, "Unauthorized", http.StatusUnauthorized)
		return
	}

	vars := mux.Vars(r)
	bookID, err := strconv.ParseUint(vars["id"], 10, 32)
	if err != nil {
		http.Error(w, "Invalid book ID", http.StatusBadRequest)
		return
	}

	tx := c.DB.Begin()

	var book models.Book
	if err := tx.First(&book, bookID).Error; err != nil {
		tx.Rollback()
		http.Error(w, "Book not found", http.StatusNotFound)
		return
	}

	if !book.AvailabilityStatus {
		tx.Rollback()
		http.Error(w, "Book not available", http.StatusBadRequest)
		return
	}

	borrowRecord := models.BorrowBook{
		BookID:     uint(bookID),
		Username:   user.Username,
		Email:      user.Email,
		Mobile:     user.Mobile,
		BorrowedOn: time.Now(),
	}

	if err := tx.Create(&borrowRecord).Error; err != nil {
		tx.Rollback()
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	book.BorrowedCount++
	book.AvailabilityStatus = book.BorrowedCount < book.TotalCount

	if err := tx.Save(&book).Error; err != nil {
		tx.Rollback()
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	tx.Commit()
	json.NewEncoder(w).Encode(borrowRecord)
}

// ReturnBook - Members Only
func (c *BookController) ReturnBook(w http.ResponseWriter, r *http.Request) {
	user, err := utils.ValidateToken(r.Cookies())
	if err != nil || user.Role != "Member" {
		http.Error(w, "Unauthorized", http.StatusUnauthorized)
		return
	}

	vars := mux.Vars(r)
	bookID, err := strconv.ParseUint(vars["id"], 10, 32)
	if err != nil {
		http.Error(w, "Invalid book ID", http.StatusBadRequest)
		return
	}

	tx := c.DB.Begin()

	var borrowRecord models.BorrowBook
	if err := tx.Where("book_id = ? AND username = ? AND returned_on IS NULL", bookID, user.Username).First(&borrowRecord).Error; err != nil {
		tx.Rollback()
		http.Error(w, "No active borrow found for this book", http.StatusNotFound)
		return
	}

	now := time.Now()
	borrowRecord.ReturnedOn = &now

	if err := tx.Save(&borrowRecord).Error; err != nil {
		tx.Rollback()
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	var book models.Book
	if err := tx.First(&book, bookID).Error; err != nil {
		tx.Rollback()
		http.Error(w, "Book not found", http.StatusNotFound)
		return
	}

	book.BorrowedCount--
	book.AvailabilityStatus = book.BorrowedCount < book.TotalCount

	if err := tx.Save(&book).Error; err != nil {
		tx.Rollback()
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	tx.Commit()
	json.NewEncoder(w).Encode(borrowRecord)
}

// GetBorrowHistory - All Users
func (c *BookController) GetBorrowHistory(w http.ResponseWriter, r *http.Request) {
	user, err := utils.ValidateToken(r.Cookies())
	if err != nil {
		http.Error(w, "Unauthorized", http.StatusUnauthorized)
		return
	}

	var borrowRecords []struct {
		BookID     uint       `json:"book_id"`
		Username   string     `json:"username"`
		Email      string     `json:"email"`
		Mobile     string     `json:"mobile"`
		BorrowedOn time.Time  `json:"borrowed_on"`
		ReturnedOn *time.Time `json:"returned_on,omitempty"`
		BookTitle  string     `json:"book_title"`
		Author     string     `json:"author"`
	}

	query := c.DB.Table("borrow_books").
		Select("borrow_books.book_id, borrow_books.username, borrow_books.email, borrow_books.mobile, borrow_books.borrowed_on, borrow_books.returned_on, books.title AS book_title, books.author").
		Joins("JOIN books ON borrow_books.book_id = books.book_id").
		Order("borrow_books.borrowed_on DESC") // Order by borrowed_on in descending order

	// If the user is a Member, filter borrow history to only show their records
	if user.Role == "Member" {
		query = query.Where("borrow_books.username = ?", user.Username)
	}

	if err := query.Find(&borrowRecords).Error; err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	json.NewEncoder(w).Encode(borrowRecords)
}
