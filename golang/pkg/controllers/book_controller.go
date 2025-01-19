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
	user, err := utils.ValidateToken(r.Cookies()) // retrieve user data from cookie
	// checking if no error while retrieving and role is either admin or librarian
	if err != nil || (user.Role != "Admin" && user.Role != "Librarian") {
		http.Error(w, "Unauthorized", http.StatusUnauthorized)
		return
	}

	// parse book details from JSON
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

	//insert the data into books table
	if err := c.DB.Create(&book).Error; err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	//sends successful response
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(book)
}

// UpdateBook - Admin and Librarian
func (c *BookController) UpdateBook(w http.ResponseWriter, r *http.Request) {

	user, err := utils.ValidateToken(r.Cookies()) // retrieve user data from cookie
	// checking if no error while retrieving and role is either admin or librarian
	if err != nil || (user.Role != "Admin" && user.Role != "Librarian") {
		http.Error(w, "Unauthorized", http.StatusUnauthorized)
		return
	}

	// retreive book id from url
	vars := mux.Vars(r)
	bookID, err := strconv.ParseUint(vars["id"], 10, 32)
	if err != nil {
		http.Error(w, "Invalid book ID", http.StatusBadRequest)
		return
	}

	//finding the book with retrievd id
	var book models.Book
	if err := c.DB.First(&book, bookID).Error; err != nil {
		http.Error(w, "Book not found", http.StatusNotFound)
		return
	}

	//update the book
	var updateData models.Book
	if err := json.NewDecoder(r.Body).Decode(&updateData); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}
	//partial updates
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
	//save the changes to database
	if err := c.DB.Save(&book).Error; err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(book)
}

// DeleteBook - Admin and Librarian
func (c *BookController) DeleteBook(w http.ResponseWriter, r *http.Request) {
	user, err := utils.ValidateToken(r.Cookies()) // retrieve user data from cookie
	// checking if no error while retrieving and role is either admin or librarian
	if err != nil || (user.Role != "Admin" && user.Role != "Librarian") {
		http.Error(w, "Unauthorized", http.StatusUnauthorized)
		return
	}

	// retrieve book id from url
	vars := mux.Vars(r)
	bookID, err := strconv.ParseUint(vars["id"], 10, 32)
	if err != nil {
		http.Error(w, "Invalid book ID", http.StatusBadRequest)
		return
	}

	// finding the book id
	var book models.Book
	if err := c.DB.First(&book, bookID).Error; err != nil {
		http.Error(w, "Book not found", http.StatusNotFound)
		return
	}

	// check if there is active borrow records with retrieved id
	var activeBorrows int64
	c.DB.Model(&models.BorrowBook{}).Where("book_id = ? AND returned_on IS NULL", bookID).Count(&activeBorrows)
	if activeBorrows > 0 {
		http.Error(w, "Cannot delete book with active borrows", http.StatusBadRequest)
		return
	}

	//delete the book with retrieved id
	if err := c.DB.Delete(&book).Error; err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(map[string]string{"message": "Book deleted successfully"})
}

// GetAllBooks - All Users with Pagination and Search
func (c *BookController) GetAllBooks(w http.ResponseWriter, r *http.Request) {

	//checks token is validated or not
	_, err := utils.ValidateToken(r.Cookies())
	if err != nil {
		http.Error(w, "Unauthorized", http.StatusUnauthorized)
		return
	}

	// Parse query parameters from frontend
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

	// search the book on keyword
	query := c.DB.Model(&models.Book{})
	if search != "" {
		searchPattern := "%" + search + "%"
		query = query.Where("book_id LIKE ? OR title LIKE ? OR author LIKE ? OR genre LIKE ? ", searchPattern, searchPattern, searchPattern, searchPattern)
	}

	// count the total no of fileterd books for pagination purpose
	var totalRecords int64
	if err := query.Count(&totalRecords).Error; err != nil {
		http.Error(w, "Failed to count books", http.StatusInternalServerError)
		return
	}

	// Get paginated books ordered by book_id
	var books []models.Book
	if err := query.Order("book_id").Limit(limit).Offset(offset).Find(&books).Error; err != nil {
		http.Error(w, "Failed to fetch books", http.StatusInternalServerError)
		return
	}

	// Prepare JSON response
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
	//checks if token is validated
	user, err := utils.ValidateToken(r.Cookies())
	if err != nil || user.Role != "Member" { //checks if role is Member
		http.Error(w, "Unauthorized", http.StatusUnauthorized)
		return
	}

	//extracts book id from url
	vars := mux.Vars(r)
	bookID, err := strconv.ParseUint(vars["id"], 10, 32)
	if err != nil {
		http.Error(w, "Invalid book ID", http.StatusBadRequest)
		return
	}

	//start a transaction to ensure data consistency
	tx := c.DB.Begin()

	//find the book with retrived id and if not found rollback
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

	//creates a new borrow record
	borrowRecord := models.BorrowBook{
		BookID:     uint(bookID),
		Username:   user.Username,
		Email:      user.Email,
		Mobile:     user.Mobile,
		BorrowedOn: time.Now(),
	}

	//insert borrow record into borrow_books table
	if err := tx.Create(&borrowRecord).Error; err != nil {
		tx.Rollback()
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	//updates book availability status
	book.BorrowedCount++
	book.AvailabilityStatus = book.BorrowedCount < book.TotalCount

	//save the data and commit the transaction
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
	user, err := utils.ValidateToken(r.Cookies()) // checks if token is validated
	if err != nil || user.Role != "Member" {      // chekcs if role is Member
		http.Error(w, "Unauthorized", http.StatusUnauthorized)
		return
	}

	//retirve book id from url
	vars := mux.Vars(r)
	bookID, err := strconv.ParseUint(vars["id"], 10, 32)
	if err != nil {
		http.Error(w, "Invalid book ID", http.StatusBadRequest)
		return
	}

	//start the transaction to maintain data consistency
	tx := c.DB.Begin()

	//checks for active borrow records for retrived book id
	var borrowRecord models.BorrowBook
	if err := tx.Where("book_id = ? AND username = ? AND returned_on IS NULL", bookID, user.Username).First(&borrowRecord).Error; err != nil {
		tx.Rollback()
		http.Error(w, "No active borrow found for this book", http.StatusNotFound)
		return
	}

	//update the returned_on status
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

	//update the availability status
	book.BorrowedCount--
	book.AvailabilityStatus = book.BorrowedCount < book.TotalCount

	if err := tx.Save(&book).Error; err != nil {
		tx.Rollback()
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	//commit the transaction
	tx.Commit()
	json.NewEncoder(w).Encode(borrowRecord)
}

// GetBorrowHistory - All Users
func (c *BookController) GetBorrowHistory(w http.ResponseWriter, r *http.Request) {
	//validates the token
	user, err := utils.ValidateToken(r.Cookies())
	if err != nil {
		http.Error(w, "Unauthorized", http.StatusUnauthorized)
		return
	}

	//strutc to hold values fecthed from database query
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

	//query to retrive borrow records from borrow_books table, username,email,mobile comes from validate token
	query := c.DB.Table("borrow_books").
		Select("borrow_books.book_id, borrow_books.username, borrow_books.email, borrow_books.mobile, borrow_books.borrowed_on, borrow_books.returned_on, books.title AS book_title, books.author").
		Joins("JOIN books ON borrow_books.book_id = books.book_id").
		Order("borrow_books.created_at DESC") // Order by borrowed_on in descending order

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
