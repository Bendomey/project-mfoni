using System.Text;
using RabbitMQ.Client;

namespace main.Lib;

public class PublishMessageInput
{
    public required RabbitMQ.Client.IConnection RabbitMqChannel { get; set; }
    public required string Message { get; set; }
    public required string QueueName { get; set; }
}

public class QueueHelper
{
    private readonly string _queueName;
    private readonly RabbitMQ.Client.IModel _rabbitMqModel;

    public QueueHelper(RabbitMQ.Client.IConnection rabbitMqChannel, string queueName)
    {
        var rabbitMqModel = rabbitMqChannel.CreateModel();

        // create queue if it does not exist.
        rabbitMqModel.QueueDeclare(
            queue: queueName,
            durable: true,
            exclusive: false,
            autoDelete: false,
            arguments: null
        );

        _rabbitMqModel = rabbitMqModel;
        _queueName = queueName;
    }

    public void PublishMessage(string message)
    {
        var body = Encoding.UTF8.GetBytes(message);

        _rabbitMqModel.BasicPublish(
            exchange: "",
            routingKey: _queueName,
            basicProperties: null,
            body: body
        );
    }
}