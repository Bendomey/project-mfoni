using NRedisStack;
using NRedisStack.RedisStackCommands;
using StackExchange.Redis;

namespace main.Configurations;

public class RedisDataBaseConfiguration
{
    public static IDatabase redisDb { get; private set; } = default!;

    public static IDatabase RedisDbConfig()
    {
        ConnectionMultiplexer redis = ConnectionMultiplexer.Connect("localhost");
        redisDb = redis.GetDatabase();

        return redisDb;
    }
}

