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
	s := rand.NewSource(time.Now().UnixNano())

	return &Game{
		mu:    &sync.Mutex{},
		users: make(map[string]string),
		rand:  rand.New(s),
	}
}

type User struct {
	Name      string `json:"name"`
	Character string `json:"character"`
}

type Game struct {
	mu    *sync.Mutex
	users map[string]string
	rand  *rand.Rand
}

func (g *Game) Add(u *User) {
	g.mu.Lock()
	g.users[strings.ToUpper(u.Name)] = strings.ToUpper(u.Character)
	g.mu.Unlock()
}

func (g *Game) Characters() []string {
	g.mu.Lock()
	chars := make([]string, 0, len(g.users))
	for _, u := range g.users {
		chars = append(chars, u)
	}
	g.mu.Unlock()

	g.rand.Shuffle(len(chars), func(i, j int) {
		chars[i], chars[j] = chars[j], chars[i]
	})

	return chars
}

func main() {
	var (
		e = echo.New()
		g = NewGame()
	)

	e.Static("/", "static")

	e.POST("/users", func(c echo.Context) error {
		var u User
		if err := c.Bind(&u); err != nil {
			c.Logger().Errorf("failed to bind user: %s", err.Error())
			return c.JSON(http.StatusBadRequest, err.Error())
		}

		g.Add(&u)

		return c.JSON(http.StatusOK, u)
	})

	e.GET("/characters", func(c echo.Context) error {
		return c.JSON(http.StatusOK, g.Characters())
	})

	e.Logger.Fatal(e.Start(":80"))
}
