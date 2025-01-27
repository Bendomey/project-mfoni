package lib

import (
	"github.com/opensearch-project/opensearch-go"
	amqp "github.com/rabbitmq/amqp091-go"
	"github.com/spf13/viper"
	"google.golang.org/grpc"
)

type MfoniSearchContext struct {
	Config           *viper.Viper
	RabbitMqChannel  *amqp.Channel
	GrpcServer       *grpc.Server
	OpenSearchClient *opensearch.Client
}
