using Microsoft.Extensions.Options;
using RabbitMQ.Client;

namespace main.Configuratons;

public class RabbitMQConnection
{
    public IConnection Channel;

    public RabbitMQConnection(IOptions<AppConstants> appConstants)
    {
        ConnectionFactory connection = new ConnectionFactory()
        {
            Uri = new Uri(appConstants.Value.RabbitMQConnectionString)
        };

        connection.DispatchConsumersAsync = true;

        Channel = connection.CreateConnection();
    }

}