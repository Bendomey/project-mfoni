package main

import (
	"flag"
	"log"
	"os"

	"github.com/Bendomey/project-mfoni/services/search/config"
	"github.com/Bendomey/project-mfoni/services/search/pkg/server"
)

func main() {
	environment := flag.String("e", "production", "")

	flag.Usage = func() {
		log.Println("Usage: server -e {mode}")
		os.Exit(1)
	}
	flag.Parse()
	config.Init(*environment)
	server.Init()
}
