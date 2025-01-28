package lib

import (
	"github.com/opensearch-project/opensearch-go"
	"github.com/spf13/viper"
	"google.golang.org/grpc"
)

type MfoniSearchContext struct {
	Config           *viper.Viper
	GrpcServer       *grpc.Server
	OpenSearchClient *opensearch.Client
}
