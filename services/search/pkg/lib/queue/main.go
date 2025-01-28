package queue

import (
	"github.com/getsentry/raven-go"
	amqp "github.com/rabbitmq/amqp091-go"
	logger "github.com/sirupsen/logrus"
	"github.com/spf13/viper"
)

// Init connects app to queue(rabbitmq).
func Init(config *viper.Viper) *amqp.Channel {
	queueServerURL := config.GetString("rabbitmq.url")

	conn, connErr := amqp.Dial(queueServerURL)

	if connErr != nil {
		raven.CaptureError(connErr, nil)
		logger.Fatal(connErr)
		logger.Info("[Queue] :: Not Connected")

		return nil
	}

	channel, chErr := conn.Channel()

	if chErr != nil {
		raven.CaptureError(chErr, nil)
		logger.Fatal(chErr)
		logger.Info("[Queue] :: Not Connected")

		return nil
	}

	logger.Info("[Queue] :: Connected Successfully")

	return channel
}
