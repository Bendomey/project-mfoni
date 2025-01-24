package lib

import (
	amqp "github.com/rabbitmq/amqp091-go"
	"github.com/spf13/viper"
	"google.golang.org/grpc"
)

type MfoniSearchContext struct {
	Config          *viper.Viper
	RabbitMqChannel *amqp.Channel
	GrpcServer      *grpc.Server
}

func NewMfoniSearchContext(
	config *viper.Viper,
	rabbitMqChannel *amqp.Channel,
	grpcServer *grpc.Server,
) MfoniSearchContext {
	return MfoniSearchContext{
		Config:          config,
		RabbitMqChannel: rabbitMqChannel,
		GrpcServer:      grpcServer,
	}
}
