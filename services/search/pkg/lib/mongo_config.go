package lib

import (
	"time"

	"github.com/getsentry/raven-go"
	logger "github.com/sirupsen/logrus"
	"github.com/spf13/viper"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
	"golang.org/x/net/context"
)

func InitMongoConfig(config *viper.Viper) *mongo.Client {
	// Initialize the mongo config.
	mongoURI := config.GetString("mongo.uri")

	// nolint: mnd
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	mongoClient, err := mongo.Connect(
		ctx,
		options.Client().ApplyURI(mongoURI),
	)

	if err != nil {
		raven.CaptureError(err, nil)
		logger.Fatal("[Mongo]:: Not Connected. Error: ", err)
	}

	// defer func() {
	// 	if err := mongoClient.Disconnect(ctx); err != nil {
	// 		raven.CaptureError(err, nil)
	// 		logger.Fatal("[Mongo]:: Could not disconnect. Error: ", err)
	// 	}
	// 	logger.Info("[Mongo]:: Disconnected successfully...")
	// }()

	// Ping the primary to verify connection
	if err := mongoClient.Ping(ctx, nil); err != nil {
		logger.Fatal("[Mongo]:: Ping failed. Error: ", err)
	}

	logger.Info("[Mongo]:: Connected successfully...")

	return mongoClient
}
