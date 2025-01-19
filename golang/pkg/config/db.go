package config

import (
	"golang/pkg/models"
	"log"

	"gorm.io/driver/mysql"
	"gorm.io/gorm"
)

func Connect() *gorm.DB {
	dsn := "root:3445@tcp(127.0.0.1:3306)/books?charset=utf8mb4&parseTime=True&loc=Local"
	db, err := gorm.Open(mysql.Open(dsn), &gorm.Config{})
	if err != nil {
		log.Fatal(err)
	}

	// Migrate the schema
	db.AutoMigrate(&models.Book{}, &models.BorrowBook{})

	return db
}
