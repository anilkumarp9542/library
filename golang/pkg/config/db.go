package config

import (
	"golang/pkg/models"
	"log" // go package for logging errors and messages to console

	"gorm.io/driver/mysql" //a mysql driver to connect with our MySQL database
	"gorm.io/gorm"         //gorm is ORM to interact with our database
)

func Connect() *gorm.DB {
	dsn := "root:3445@tcp(127.0.0.1:3306)/books?charset=utf8mb4&parseTime=True&loc=Local"
	db, err := gorm.Open(mysql.Open(dsn), &gorm.Config{})
	if err != nil {
		log.Fatal(err)
	}

	// Migrate the schema
	db.AutoMigrate(&models.Book{}, &models.BorrowBook{}) // books and borrow_books tables in databases

	return db
}
