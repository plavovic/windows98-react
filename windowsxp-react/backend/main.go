package main

import (
	"net/http"
	"net/url" // Added: Required for url.Values{}

	"github.com/gin-gonic/gin"
	cors "github.com/rs/cors/wrapper/gin"
)

type DesktopItem struct {
	ID    string `json:"id"`
	Label string `json:"label"`
	Icon  string `json:"icon"`
}

const (
	ClientID    = "e004883a41624a78b0609fd21636c189"
	RedirectURI = "http://127.0.0.1:8080/api/auth/spotify/callback"
	AuthURL     = "https://accounts.spotify.com/authorize"
)

func main() {
	r := gin.Default()

	r.Use(cors.New(cors.Options{
		AllowedOrigins: []string{"http://localhost:5173", "http://127.0.0.1:5173"},
		AllowedMethods: []string{"GET", "POST", "PUT", "DELETE"},
		AllowedHeaders: []string{"Origin", "Content-Type"},
	}))

	r.GET("/api/auth/spotify/login", func(c *gin.Context) {
		scopes := "user-read-playback-state user-modify-playback-state streaming"

		params := url.Values{}
		params.Add("response_type", "code")
		params.Add("client_id", ClientID)
		params.Add("scope", scopes)
		params.Add("redirect_uri", RedirectURI)

		fullAuthURL := AuthURL + "?" + params.Encode()
		c.Redirect(http.StatusFound, fullAuthURL)
	})

	r.GET("/api/auth/spotify/callback", func(c *gin.Context) {
		code := c.Query("code")
		if code == "" {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Missing code parameter"})
			return
		}

		c.Redirect(http.StatusFound, "http://localhost:5173?authenticated=true")
	})

	r.GET("/api/desktop/icons", func(c *gin.Context) {
		icons := []DesktopItem{
			{ID: "computer", Label: "My Computer", Icon: "computer"},
			{ID: "spotify", Label: "Spotify 98", Icon: "spotify"},
			{ID: "documents", Label: "My Documents", Icon: "documents"},
			{ID: "browser", Label: "Internet Explorer", Icon: "browser"},
			{ID: "trash", Label: "Recycle Bin", Icon: "trash"},
		}
		c.JSON(http.StatusOK, gin.H{
			"status": "success",
			"data":   icons,
		})
	})

	r.Run(":8080")
}