package lib

import (
	"github.com/opensearch-project/opensearch-go/v2"
	"github.com/spf13/viper"
	"go.mongodb.org/mongo-driver/mongo"
	"google.golang.org/grpc"
)

type MfoniSearchContext struct {
	Config           *viper.Viper
	GrpcServer       *grpc.Server
	OpenSearchClient *opensearch.Client
	MongoClient      *mongo.Client
}
