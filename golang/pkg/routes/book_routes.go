package routes

import (
	"golang/pkg/controllers"

	"github.com/gorilla/mux"
	"gorm.io/gorm"
)

func RegisterBookRoutes(r *mux.Router, db *gorm.DB) {
	controller := controllers.NewBookController(db)

	r.HandleFunc("/books/createBook", controller.CreateBook).Methods("POST") //CreateBook
	// r.HandleFunc("/books/id/{id}", controller.GetBookbyId).Methods("GET")           //GetBookbyId
	// r.HandleFunc("/books/title/{title}", controller.GetBookbyTitle).Methods("GET")  //GetBookbyTitle
	r.HandleFunc("/books", controller.GetAllBooks).Methods("GET")                   //GetAllBooks
	r.HandleFunc("/books/updateBook/{id}", controller.UpdateBook).Methods("PUT")    //UpdateBook
	r.HandleFunc("/books/deleteBook/{id}", controller.DeleteBook).Methods("DELETE") //DeleteBook
	r.HandleFunc("/books/{id}/borrow", controller.BorrowBook).Methods("POST")       //BorrowBook
	r.HandleFunc("/books/{id}/return", controller.ReturnBook).Methods("POST")       //ReturnBook
	r.HandleFunc("/history", controller.GetBorrowHistory).Methods("GET")            //GetBorrowHistory
}
