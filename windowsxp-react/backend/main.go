package main

import (
	"encoding/json"
	"fmt"
	"net/http"
	"net/url"
	"os"
	"strings"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"
	cors "github.com/rs/cors/wrapper/gin"
)

type DesktopItem struct {
	ID    string `json:"id"`
	Label string `json:"label"`
	Icon  string `json:"icon"`
}

type SpotifyTokenResponse struct {
	AccessToken  string `json:"access_token"`
	TokenType    string `json:"token_type"`
	ExpiresIn    int    `json:"expires_in"`
	RefreshToken string `json:"refresh_token"`
	Scope        string `json:"scope"`
}

const (
	AuthURL  = "https://accounts.spotify.com/authorize"
	TokenURL = "https://accounts.spotify.com/api/token"
)

type spotifyConfig struct {
	ClientID     string
	ClientSecret string
	RedirectURI  string
	FrontendURL  string
}

func loadSpotifyConfig() (spotifyConfig, error) {
	config := spotifyConfig{
		ClientID:     os.Getenv("SPOTIFY_CLIENT_ID"),
		ClientSecret: os.Getenv("SPOTIFY_CLIENT_SECRET"),
		RedirectURI:  os.Getenv("SPOTIFY_REDIRECT_URI"),
		FrontendURL:  os.Getenv("FRONTEND_URL"),
	}

	if config.RedirectURI == "" {
		config.RedirectURI = "http://127.0.0.1:8081/api/auth/spotify/callback"
	}
	if config.FrontendURL == "" {
		config.FrontendURL = "http://localhost:5173"
	}

	missing := make([]string, 0, 2)
	if config.ClientID == "" {
		missing = append(missing, "SPOTIFY_CLIENT_ID")
	}
	if config.ClientSecret == "" {
		missing = append(missing, "SPOTIFY_CLIENT_SECRET")
	}
	if len(missing) > 0 {
		return spotifyConfig{}, fmt.Errorf("missing required environment variables: %s", strings.Join(missing, ", "))
	}

	return config, nil
}

func main() {
	if err := godotenv.Load(); err != nil {
		fmt.Println("No backend/.env file found; using process environment variables")
	}

	spotify, err := loadSpotifyConfig()
	if err != nil {
		fmt.Println("Spotify configuration error:", err)
		return
	}

	r := gin.Default()

	// FIXED: Complete CORS support for browser preflights
	r.Use(cors.New(cors.Options{
		AllowedOrigins:   []string{"http://localhost:5173", "http://127.0.0.1:5173"},
		AllowedMethods:   []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowedHeaders:   []string{"Origin", "Content-Type", "Authorization"},
		AllowCredentials: true,
	}))

	r.GET("/api/auth/spotify/login", func(c *gin.Context) {
		scopes := "user-read-playback-state user-modify-playback-state streaming"

		params := url.Values{}
		params.Add("response_type", "code")
		params.Add("client_id", spotify.ClientID)
		params.Add("scope", scopes)
		params.Add("redirect_uri", spotify.RedirectURI)

		fullAuthURL := AuthURL + "?" + params.Encode()
		c.Redirect(http.StatusFound, fullAuthURL)
	})

	r.GET("/api/auth/spotify/callback", func(c *gin.Context) {
		if authError := c.Query("error"); authError != "" {
			redirectURL := spotify.FrontendURL + "?spotify_error=" + url.QueryEscape(authError)
			if description := c.Query("error_description"); description != "" {
				redirectURL += "&spotify_error_description=" + url.QueryEscape(description)
			}
			c.Redirect(http.StatusFound, redirectURL)
			return
		}

		code := c.Query("code")
		if code == "" {
			c.Redirect(http.StatusFound, spotify.FrontendURL+"?spotify_error=missing_code")
			return
		}

		data := url.Values{}
		data.Set("grant_type", "authorization_code")
		data.Set("code", code)
		data.Set("redirect_uri", spotify.RedirectURI)

		req, err := http.NewRequest("POST", TokenURL, strings.NewReader(data.Encode()))
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create request"})
			return
		}

		req.SetBasicAuth(spotify.ClientID, spotify.ClientSecret)
		req.Header.Set("Content-Type", "application/x-www-form-urlencoded")

		client := &http.Client{Timeout: 10 * time.Second}
		resp, err := client.Do(req)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
		defer resp.Body.Close()

		if resp.StatusCode != http.StatusOK {
			var errBody map[string]interface{}
			json.NewDecoder(resp.Body).Decode(&errBody)
			fmt.Println("Spotify Token Error: ", errBody)
			c.JSON(resp.StatusCode, gin.H{"error": "Spotify rejected token exchange", "details": errBody})
			return
		}

		var tokenData SpotifyTokenResponse
		if err := json.NewDecoder(resp.Body).Decode(&tokenData); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to decode token response"})
			return
		}

		// FIXED: Changed '#' to '?' so App.tsx can parse parameters with URLSearchParams
		redirectURL := fmt.Sprintf("%s?authenticated=true&access_token=%s", spotify.FrontendURL, url.QueryEscape(tokenData.AccessToken))
		c.Redirect(http.StatusFound, redirectURL)
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

	// FIXED: Bind explicitly to IPv4 127.0.0.1
	if err := r.Run(":8081"); err != nil {
		fmt.Println("Backend server error:", err)
	}
}