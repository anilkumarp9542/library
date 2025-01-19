package main

import (
	"golang/pkg/config"
	"golang/pkg/routes"
	"log"
	"net/http"

	"github.com/gorilla/handlers"
	"github.com/gorilla/mux"
)

func main() {
	// Initialize database
	db := config.Connect()

	// Create router
	r := mux.NewRouter()

	// Setup routes
	routes.RegisterBookRoutes(r, db)

	// CORS setup
	allowedOrigins := handlers.AllowedOrigins([]string{"http://localhost:5173"}) // Add your frontend origin here
	allowedMethods := handlers.AllowedMethods([]string{"GET", "POST", "PUT", "DELETE", "OPTIONS"})
	allowedHeaders := handlers.AllowedHeaders([]string{"Content-Type"})
	allowCredentials := handlers.AllowCredentials()

	// Start server with CORS
	log.Println("Server starting on port 8080...")
	log.Fatal(http.ListenAndServe(":8080", handlers.CORS(allowedOrigins, allowedMethods, allowedHeaders, allowCredentials)(r)))
}
