package main

import (
	"net/http"
	"github.com/gin-gonic/gin"
	cors "github.com/rs/cors/wrapper/gin"
)

type DesktopItem struct {
	ID string `json:"id"`
	Label string `json:"label"`
	Icon string `json:"icon"`
}

func main() {
	r := gin.Default()

	r.Use(cors.New(cors.Options {
		AllowedOrigins: []string{"http://localhost:5173"},
		AllowedMethods: []string{"GET", "POST", "PUT", "DELETE"},
		AllowedHeaders: []string{"Origin", "Content-Type"},
	}))

	r.GET("/api/desktop/icons", func(c *gin.Context) {
		icons:= []DesktopItem{
			{ID: "computer", Label: "Icon 1", Icon: "/icons/mypcpng.png"},
			{ID: "spotify", Label: "Icon 2", Icon: "/icons/spotifypng.png"},
			{ID: "documents", Label: "Icon 3", Icon: "/icons/documentspng.png"},
			{ID: "browser", Label: "Icon 4", Icon: "/icons/internetexplorerpng.png"},
			{ID: "trash", Label: "Icon 5", Icon: "/icons/recyclebin.png"},
		}
		c.JSON(http.StatusOK, gin.H  {
		"status": "success",
		"data": icons,
		})
	})

	r.Run(":8080")
}