package routes

import (
	"golang/pkg/controllers"

	"github.com/gorilla/mux" // router and dispatcher for handling HTTP requests in go
	"gorm.io/gorm"
)

func RegisterBookRoutes(r *mux.Router, db *gorm.DB) {
	controller := controllers.NewBookController(db) //creates an instance of controller and passes database connection so that it interacts with database

	r.HandleFunc("/books/createBook", controller.CreateBook).Methods("POST")        //CreateBook
	r.HandleFunc("/books", controller.GetAllBooks).Methods("GET")                   //GetAllBooks
	r.HandleFunc("/books/updateBook/{id}", controller.UpdateBook).Methods("PUT")    //UpdateBook
	r.HandleFunc("/books/deleteBook/{id}", controller.DeleteBook).Methods("DELETE") //DeleteBook
	r.HandleFunc("/books/{id}/borrow", controller.BorrowBook).Methods("POST")       //BorrowBook
	r.HandleFunc("/books/{id}/return", controller.ReturnBook).Methods("POST")       //ReturnBook
	r.HandleFunc("/history", controller.GetBorrowHistory).Methods("GET")            //GetBorrowHistory
}
