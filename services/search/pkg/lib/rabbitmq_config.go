package lib

import (
	"context"

	"github.com/getsentry/raven-go"
	amqp "github.com/rabbitmq/amqp091-go"
	logger "github.com/sirupsen/logrus"
	"github.com/spf13/viper"
)

// Factory connects app to rabbitmq.
func InitQueue(config *viper.Viper) *amqp.Channel {
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

type PublishMessageToQueueInput struct {
	QueueName    string
	ExchangeName string
	Message      []byte
	AppContext   MfoniSearchContext
}

func PublishMessageToQueue(input PublishMessageToQueueInput) error {
	queueDeclare, queueDeclareErr := input.AppContext.RabbitMqChannel.QueueDeclare(
		input.QueueName, // name
		true,            // durable
		false,           // delete when unused
		false,           // exclusive
		false,           // no-wait
		nil,             // arguments
	)

	if queueDeclareErr != nil {
		return queueDeclareErr
	}

	err := input.AppContext.RabbitMqChannel.PublishWithContext(
		context.Background(),
		input.ExchangeName, // exchange
		queueDeclare.Name,  // routing key
		false,              // mandatory
		false,              // immediate
		amqp.Publishing{
			ContentType: "text/plain",
			Body:        input.Message,
		},
	)

	return err
}
