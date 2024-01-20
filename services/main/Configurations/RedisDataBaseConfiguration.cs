using StackExchange.Redis;

namespace main.Configurations;

public class RedisDataBaseConfiguration
{
    public static IDatabase redisDb { get; private set; } = default!;

    public static IDatabase RedisDbConfig()
    {
        IConfiguration configuration = AppSettingsDevConfiguration.DevConfig();
        ConnectionMultiplexer redis = ConnectionMultiplexer.Connect($"{configuration["RedisDatabase.ConnectionString"]}");
        redisDb = redis.GetDatabase();

        return redisDb;
    }
}

