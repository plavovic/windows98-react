# 🪟 Windows 98 Spotify Webamp

A nostalgic, interactive Windows 98 desktop environment built with React, TypeScript, and Go. Featuring draggable windows, a dynamic desktop canvas, and a retro Winamp-inspired Spotify player with authentic UI styling and OAuth authentication.

---

## 🌟 Short Description

**Windows 98 Spotify Webamp** brings late-90s desktop computing back to life on the modern web. Built with a React/TypeScript frontend and a Go (Gin) backend, this app recreates a retro desktop operating system complete with draggable windows, customizable desktop icons, a dynamic taskbar clock, and a fully functional Spotify player integration.

---

## ✨ Features

- **📼 Authentic Windows 98 Design:** Styled with classic pixelated icons, inset/outset win-style borders, and retro desktop color schemes.
- **📱 Dynamic Desktop Canvas:** Custom desktop icons fetched from a Go backend REST API.
- **🖱️ Interactive Window Management:** Fully draggable windows using `react-draggable` with dynamic z-index layering and taskbar window toggles.
- **🔑 Spotify OAuth 2.0 Integration:** Secure server-side authentication flow using Go and Spotify's Web API.
- **🎵 Winamp Player Interface:** Retro-styled player interface displaying active playback statuses and integrated music playback capabilities.
- **⚡ High-Performance Architecture:** Fast frontend build with Vite + React + Tailwind CSS paired with a high-throughput Gin backend in Go.

---

## 🛠️ Tech Stack

### Frontend
- **Framework:** React 18 (TypeScript)
- **Build Tool:** Vite
- **Styling:** Tailwind CSS + Lucide Icons
- **Window Interactivity:** `react-draggable`

### Backend
- **Language:** Go 1.22+
- **Web Framework:** Gin Gonic
- **Environment Management:** `godotenv`
- **CORS Management:** `rs/cors`

---

## 🚀 Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) (v18 or higher)
- [Go](https://go.dev/) (v1.20 or higher)
- A [Spotify Developer Account](https://developer.spotify.com/dashboard)

---

## ⚙️ Configuration & Setup

### 1. Spotify Developer Setup
1. Log in to the [Spotify Developer Dashboard](https://developer.spotify.com/dashboard).
2. Create a new app and copy your **Client ID** and **Client Secret**.
3. Under **Redirect URIs**, add:
   ```text
   [http://127.0.0.1:8080/api/auth/spotify/callback](http://127.0.0.1:8080/api/auth/spotify/callback)
