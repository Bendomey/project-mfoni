package processors

import (
	"encoding/json"
	"time"

	"github.com/Bendomey/project-mfoni/services/search/internal/services"
	"github.com/Bendomey/project-mfoni/services/search/pkg/lib"
	"github.com/Bendomey/project-mfoni/services/search/pkg/lib/queue"
	"github.com/getsentry/raven-go"
	amqp "github.com/rabbitmq/amqp091-go"
	"github.com/sirupsen/logrus"
)

const (
	// How long we should wait while queue tries to connect/reconnect.
	connectDelay = time.Second * 10

	// How long we should wait before processing the next message.
	processingMessageDelay = time.Second * 2
)

// Subscribe as a worker to rabbitmq queue and ingest data into opensearch.
func ProcessContent(appCtx lib.MfoniSearchContext, services services.Services) {
	logrus.Info("Initializing content processor...")

	rabbitmqAddr := appCtx.Config.GetString("rabbitmq.url")
	contentQueue := queue.New(lib.ContentQueueName, rabbitmqAddr)

	// Give the connection sometime to set up.
	<-time.After(connectDelay)

	deliveries, err := contentQueue.Consume()
	if err != nil {
		contentQueue.Errlog.Errorf("could not start consuming: %s\n", err)
		return
	}
	/**
	* This channel will receive a notification when a channel closed event
	* happens. This must be different from Client.notifyChanClose because the
	* library sends only one notification and Client.notifyChanClose already has
	* a receiver in handleReconnect().
	* Recommended to make it buffered to avoid deadlocks.
	 */
	chClosedCh := make(chan *amqp.Error, 1)
	contentQueue.Channel.NotifyClose(chClosedCh)

	for {
		select {
		case amqErr := <-chClosedCh:
			// This case handles the event of closed channel. e.g. abnormal shutdown.
			contentQueue.Errlog.Printf("[Queue]:: AMQP Channel closed due to: %s\n", amqErr)

			deliveries, err = contentQueue.Consume()
			if err != nil {
				// If the AMQP channel is not ready, it will continue the loop. Next
				// iteration will enter this case because chClosedCh is closed by the
				// library.
				contentQueue.Errlog.Println("[Queue]:: error trying to consume, will try again")
				continue
			}

			// Re-set channel to receive notifications.
			// The library closes this channel after abnormal shutdown.
			chClosedCh = make(chan *amqp.Error, 1)
			contentQueue.Channel.NotifyClose(chClosedCh)
		case delivery := <-deliveries:
			if processErr := ProcessMessage(delivery.Body); processErr != nil {
				raven.CaptureError(processErr, map[string]string{
					"message": string(delivery.Body),
					"queue":   lib.ContentQueueName,
					"action":  "Processing message",
				})

				contentQueue.Errlog.Errorf("[Worker]:: error processing message: %s\n", processErr)

				if nackErr := delivery.Nack(false, false); nackErr != nil {
					raven.CaptureError(nackErr, map[string]string{
						"message": string(delivery.Body),
						"action":  "not-acknowledging message",
					})
					contentQueue.Errlog.Printf("[Worker]:: error not-acknowledging message: %s\n", nackErr)
				}
			}

			// Acknowledge the message.
			if ackErr := delivery.Ack(false); ackErr != nil {
				raven.CaptureError(
					ackErr,
					map[string]string{
						"message": string(delivery.Body),
						"action":  "acknowledging message",
					},
				)
				contentQueue.Errlog.Printf("[Worker]:: error acknowledging message: %s\n", ackErr)
			}
			<-time.After(processingMessageDelay)
		}
	}
}

type Message struct {
	Type string `json:"type"`
	// nolint: tagliatelle
	ContentID string `json:"content_id"`
}

func ProcessMessage(imessage []byte) error {
	logrus.Info("Processing message: ", string(imessage))

	// Declare a variable of the struct type.
	var message Message

	// Unmarshal JSON into the struct.
	err := json.Unmarshal(imessage, &message)
	if err != nil {
		return err
	}

	logrus.Info("Message type: ", message.Type)
	logrus.Info("Content ID: ", message.ContentID)
	// get the type of message

	// get the content_id.
	// get the content from the database.
	// push the content to opensearch.
	// if the content is not found, log the error.
	// if the content is found, push the content to opensearch.
	// if the content is pushed to opensearch, log the success.
	// if the content is not pushed to opensearch, log the error.
	return nil
}
