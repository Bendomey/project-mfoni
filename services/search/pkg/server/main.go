package server

import (
	"fmt"
	"net"

	"github.com/Bendomey/project-mfoni/services/search/config"
	"github.com/Bendomey/project-mfoni/services/search/internal/handlers"
	"github.com/Bendomey/project-mfoni/services/search/pkg/lib"
	log "github.com/sirupsen/logrus"
	"google.golang.org/grpc"
)

func Init() {
	config := config.GetConfig()

	if config.GetString("sentry.environment") != "development" && config.GetString("sentry.dsn") != "" {
		lib.InitSentry(config)
	}

	rabbitmqChannel := lib.InitQueue(config)

	gprcServer := grpc.NewServer()

	context := lib.NewMfoniSearchContext(config, rabbitmqChannel, gprcServer)

	// Register the rpc handlers
	handlers.Factory(context)

	listen, err := net.Listen("tcp", fmt.Sprintf(":%d", config.GetInt("app.port")))
	if err != nil {
		log.Fatalf("Could not listen on port %d: %v", config.GetInt("app.port"), err)
	}

	log.Info("Server started on port: ", config.GetInt("app.port"))

	if err := gprcServer.Serve(listen); err != nil {
		log.Fatalf("Failed to serve grpc %v", err)
	}
}
