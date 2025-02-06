package server

import (
	"fmt"
	"net"

	"github.com/Bendomey/project-mfoni/services/search/config"
	"github.com/Bendomey/project-mfoni/services/search/internal/handlers"
	"github.com/Bendomey/project-mfoni/services/search/internal/processors"
	"github.com/Bendomey/project-mfoni/services/search/internal/services"
	"github.com/Bendomey/project-mfoni/services/search/pkg/lib"
	log "github.com/sirupsen/logrus"
	"google.golang.org/grpc"
)

func Init() {
	config := config.GetConfig()

	if config.GetString("sentry.environment") != "development" && config.GetString("sentry.dsn") != "" {
		lib.InitSentry(config)
	}

	openSearchClient := lib.InitOpenSearch(config)

	mongoClient := lib.InitMongoConfig(config)

	gprcServer := grpc.NewServer()

	// create an app context.
	appContext := lib.MfoniSearchContext{
		Config:           config,
		GrpcServer:       gprcServer,
		OpenSearchClient: openSearchClient,
		MongoClient:      mongoClient,
	}

	// Register the rpc handlers
	services := services.InitServices(appContext)

	// Register the processors
	processors.Factory(appContext, services)

	// Register the handlers
	handlers.Factory(appContext, services)

	listen, err := net.Listen("tcp", fmt.Sprintf(":%d", config.GetInt("app.port")))
	if err != nil {
		log.Fatalf("Could not listen on port %d: %v", config.GetInt("app.port"), err)
	}

	log.Info("All systems online. Server started on port: ", config.GetInt("app.port"))

	if err := gprcServer.Serve(listen); err != nil {
		log.Fatalf("Failed to serve grpc %v", err)
	}
}
