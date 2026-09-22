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
			{ID: "1", Label: "Icon 1", Icon: "icon1.png"},
			{ID: "2", Label: "Icon 2", Icon: "icon2.png"},
		}
		c.JSON(http.StatusOK, gin.H
		"status": "success",
		"data": icons,
		})
	})

	r.Run(":8080")
}