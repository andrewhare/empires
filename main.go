package main

import (
	"math/rand"
	"net/http"
	"strings"
	"sync"
	"time"

	"github.com/labstack/echo"
)

func NewGame() *Game {
	return &Game{
		mu:                &sync.Mutex{},
		usersToCharacters: make(map[string]string),
	}
}

type User struct {
	Name      string `json:"name"`
	Character string `json:"character"`
}

type Game struct {
	mu                *sync.Mutex
	usersToCharacters map[string]string
}

func (g *Game) Add(u *User) {
	g.mu.Lock()
	g.usersToCharacters[strings.ToUpper(u.Name)] = strings.ToUpper(u.Character)
	g.mu.Unlock()
}

func (g *Game) Characters() []string {
	g.mu.Lock()
	chars := make([]string, 0, len(g.usersToCharacters))
	for _, s := range g.usersToCharacters {
		chars = append(chars, s)
	}
	g.mu.Unlock()

	rand.Seed(time.Now().UnixNano())
	rand.Shuffle(len(chars), func(i, j int) {
		chars[i], chars[j] = chars[j], chars[i]
	})
	return chars
}

var game = NewGame()

func main() {
	e := echo.New()
	e.Static("/", "static")

	e.POST("/users", func(c echo.Context) error {
		u := &User{}
		if err := c.Bind(u); err != nil {
			c.Logger().Errorf("failed to bind user: %s", err.Error())
			return c.JSON(http.StatusBadRequest, err.Error())
		}
		game.Add(u)
		return c.JSON(http.StatusOK, u)
	})

	e.GET("/characters", func(c echo.Context) error {
		return c.JSON(http.StatusOK, game.Characters())
	})

	e.Logger.Fatal(e.Start(":8080"))
}
