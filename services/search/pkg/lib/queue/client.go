package queue

import (
	"context"
	"errors"
	"os"
	"sync"
	"time"

	"github.com/Bendomey/project-mfoni/services/search/pkg/lib"
	amqp "github.com/rabbitmq/amqp091-go"
	logger "github.com/sirupsen/logrus"
)

/**
* Client is the base struct for handling connection recovery, consumption and
* publishing. Note that this struct has an internal mutex to safeguard against
* data races. As you develop and iterate over this example, you may need to add
* further locks, or safeguards, to keep your application safe from data races
 */

type Client struct {
	M               *sync.Mutex
	QueueName       string
	Infolog         *logger.Logger
	Errlog          *logger.Logger
	Connection      *amqp.Connection
	Channel         *amqp.Channel
	Done            chan bool
	NotifyConnClose chan *amqp.Error
	NotifyChanClose chan *amqp.Error
	NotifyConfirm   chan amqp.Confirmation
	IsReady         bool
}

const (
	// When reconnecting to the server after connection failure.
	reconnectDelay = 5 * time.Second

	// When setting up the channel after a channel exception.
	reInitDelay = 2 * time.Second

	// When resending messages the server didn't confirm.
	resendDelay = 5 * time.Second

	// When publishing a message, how long to wait for a confirmation.
	publishMessageDelay = 30 * time.Second
)

var (
	errNotConnected  = errors.New("not connected to a server")
	errAlreadyClosed = errors.New("already closed: not connected to the server")
	errShutdown      = errors.New("client is shutting down")
)

/**
* New creates a new consumer state instance, and automatically
* attempts to connect to the server.
 */
func New(queueName, addr string) *Client {
	client := Client{
		M: &sync.Mutex{},
		Infolog: &logger.Logger{
			Out:       os.Stderr,
			Formatter: new(logger.TextFormatter),
			Hooks:     make(logger.LevelHooks),
			Level:     logger.InfoLevel,
		},
		Errlog: &logger.Logger{
			Out:       os.Stderr,
			Formatter: new(logger.TextFormatter),
			Hooks:     make(logger.LevelHooks),
			Level:     logger.ErrorLevel,
		},
		QueueName: queueName,
		Done:      make(chan bool),
	}

	go client.handleReconnect(addr)
	return &client
}

/**
* handleReconnect will wait for a connection error on
* notifyConnClose, and then continuously attempt to reconnect.
 */
func (client *Client) handleReconnect(addr string) {
	for {
		client.M.Lock()
		client.IsReady = false
		client.M.Unlock()

		client.Infolog.Println("[Queue]:: attempting to connect")

		conn, err := client.connect(addr)
		if err != nil {
			client.Errlog.Println("[Queue]:: failed to connect. Retrying...")

			select {
			case <-client.Done:
				return
			case <-time.After(reconnectDelay):
			}
			continue
		}

		if done := client.handleReInit(conn); done {
			break
		}
	}
}

// connect will create a new AMQP connection.
func (client *Client) connect(addr string) (*amqp.Connection, error) {
	conn, err := amqp.Dial(addr)
	if err != nil {
		return nil, err
	}

	client.changeConnection(conn)
	client.Infolog.Println("[Queue]:: connected")
	return conn, nil
}

/**
* handleReInit will wait for a channel error
* and then continuously attempt to re-initialize both channels.
 */
func (client *Client) handleReInit(conn *amqp.Connection) bool {
	for {
		client.M.Lock()
		client.IsReady = false
		client.M.Unlock()

		err := client.init(conn)
		if err != nil {
			client.Errlog.Println("[Queue]:: failed to initialize channel, retrying...")

			select {
			case <-client.Done:
				return true
			case <-client.NotifyConnClose:
				client.Infolog.Println("[Queue]:: connection closed, reconnecting...")
				return false
			case <-time.After(reInitDelay):
			}
			continue
		}

		select {
		case <-client.Done:
			return true
		case <-client.NotifyConnClose:
			client.Infolog.Println("[Queue]:: connection closed, reconnecting...")
			return false
		case <-client.NotifyChanClose:
			client.Infolog.Println("[Queue]:: channel closed, re-running init...")
		}
	}
}

// init will initialize channel & declare queue.
func (client *Client) init(conn *amqp.Connection) error {
	channel, err := conn.Channel()
	if err != nil {
		return err
	}

	err = channel.Confirm(false)
	if err != nil {
		return err
	}
	_, err = channel.QueueDeclare(
		client.QueueName,
		true,  // Durable
		false, // Delete when unused
		false, // Exclusive
		false, // No-wait
		nil,   // Arguments
	)
	if err != nil {
		return err
	}

	client.changeChannel(channel)
	client.M.Lock()
	client.IsReady = true
	client.M.Unlock()
	client.Infolog.Println("[Queue]:: client init done")

	return nil
}

/**
* changeConnection takes a new connection to the queue,
* and updates the close listener to reflect this.
 */
func (client *Client) changeConnection(connection *amqp.Connection) {
	client.Connection = connection
	client.NotifyConnClose = make(chan *amqp.Error, 1)
	client.Connection.NotifyClose(client.NotifyConnClose)
}

/**
* changeChannel takes a new channel to the queue,
* and updates the channel listeners to reflect this.
 */
func (client *Client) changeChannel(channel *amqp.Channel) {
	client.Channel = channel
	client.NotifyChanClose = make(chan *amqp.Error, 1)
	client.NotifyConfirm = make(chan amqp.Confirmation, 1)
	client.Channel.NotifyClose(client.NotifyChanClose)
	client.Channel.NotifyPublish(client.NotifyConfirm)
}

/**
* Push will push data onto the queue, and wait for a confirmation.
* This will block until the server sends a confirmation. Errors are
* only returned if the push action itself fails, see UnsafePush.
 */
func (client *Client) Push(data []byte) error {
	client.M.Lock()
	if !client.IsReady {
		client.M.Unlock()
		return errNotConnected
	}
	client.M.Unlock()
	for {
		err := client.UnsafePush(data)
		if err != nil {
			client.Errlog.Println("[Queue]:: push failed. Retrying...")
			select {
			case <-client.Done:
				return errShutdown
			case <-time.After(resendDelay):
			}
			continue
		}
		confirm := <-client.NotifyConfirm
		if confirm.Ack {
			client.Infolog.Infof("[Queue]:: push confirmed [%d]", confirm.DeliveryTag)
			return nil
		}
	}
}

/**
* UnsafePush will push to the queue without checking for
* confirmation. It returns an error if it fails to connect.
* No guarantees are provided for whether the server will
* receive the message.
 */
func (client *Client) UnsafePush(data []byte) error {
	client.M.Lock()
	if !client.IsReady {
		client.M.Unlock()
		return errNotConnected
	}
	client.M.Unlock()

	ctx, cancel := context.WithTimeout(context.Background(), publishMessageDelay)
	defer cancel()

	return client.Channel.PublishWithContext(
		ctx,
		"",               // Exchange
		client.QueueName, // Routing key
		false,            // Mandatory
		false,            // Immediate
		amqp.Publishing{
			ContentType:     "text/plain",
			Body:            data,
			Headers:         amqp.Table{},
			ContentEncoding: "",
			DeliveryMode:    amqp.Persistent,
			Priority:        0,
			AppId:           lib.QueueAppID,
			UserId:          "guest",
		},
	)
}

/**
* Consume will continuously put queue items on the channel.
* It is required to call delivery.Ack when it has been
* successfully processed, or delivery.Nack when it fails.
* Ignoring this will cause data to build up on the server.
 */
func (client *Client) Consume() (<-chan amqp.Delivery, error) {
	client.M.Lock()
	if !client.IsReady {
		client.M.Unlock()
		return nil, errNotConnected
	}
	client.M.Unlock()
	client.Infolog.Info("[Queue]:: Consuming messages from the queue")

	if err := client.Channel.Qos(
		1,     // prefetchCount
		0,     // prefetchSize
		false, // global
	); err != nil {
		return nil, err
	}

	return client.Channel.Consume(
		client.QueueName,
		"",    // Consumer
		false, // Auto-Ack
		false, // Exclusive
		false, // No-local
		false, // No-Wait
		nil,   // Args
	)
}

// Close will cleanly shut down the channel and connection.
func (client *Client) Close() error {
	client.M.Lock()
	// we read and write isReady in two locations, so we grab the lock and hold onto
	// it until we are finished.
	defer client.M.Unlock()

	if !client.IsReady {
		return errAlreadyClosed
	}
	close(client.Done)
	err := client.Channel.Close()
	if err != nil {
		return err
	}
	err = client.Connection.Close()
	if err != nil {
		return err
	}

	client.IsReady = false
	return nil
}
