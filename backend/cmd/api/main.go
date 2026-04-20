package main

import (
	"log"
	"net/http"
	"os"

	"todolist/backend/internal/httpserver"
)

func main() {
	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	server := &http.Server{
		Addr:    ":" + port,
		Handler: httpserver.NewRouter(),
	}

	log.Printf("backend listening on :%s", port)

	if err := server.ListenAndServe(); err != nil && err != http.ErrServerClosed {
		log.Fatal(err)
	}
}
