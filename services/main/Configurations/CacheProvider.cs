using System.Text.Json;
using StackExchange.Redis;

namespace main.Configuratons;

public class CacheProvider
{
    private readonly IDatabase _redis;
    private readonly IServer _redisServer;
    public static readonly bool CacheEnabled = true; // Controls if caching is enabled or not appwide.
    public static readonly string CachePrefix = "mfoni-";
    public static readonly TimeSpan? CacheTTL = null;

    public static readonly Dictionary<string, string> CacheEntities = new Dictionary<string, string>
    {
        // Only caching content related entities for now.
        { "collections", "collections" },
        { "contents", "contents" },
        { "tags", "tags" },

        // { "admins", "admins" },
        // { "auth", "users" },
        // { "waitlists", "waitlist" },
        // { "users", "users" },
        // { "creator-subscriptions", "subscriptions" },
        // // TODO: update endpoint to get wallet for admins and make sure to update admins app.
        // { "wallet-transactions", "wallet-transactions" },
        // { "wallets", "wallets" },
        // { "wallet", "wallets" },
    };

    public CacheProvider(IConnectionMultiplexer redis)
    {
        _redis = redis.GetDatabase();
        _redisServer = redis.GetServer(redis.GetEndPoints()[0]);
    }

    public async Task<T?> GetFromCache<T>(string key)
    {
        var redisValue = await _redis.StringGetAsync($"{CachePrefix}{key}");
        return redisValue.HasValue ? JsonSerializer.Deserialize<T>(redisValue!) : default(T);
    }

    public async Task SetCache<T>(string key, T value, TimeSpan? timeSpan)
    {
        var redisValue = JsonSerializer.Serialize(value);

        if (typeof(T) == typeof(string))
        {
            redisValue = value as string;
        }

        // TODO: lock the cache key when making updates - integrate redlock.
        await _redis.StringSetAsync($"{CachePrefix}{key}", redisValue, timeSpan);
    }

    public async Task ClearCache(RedisKey key)
    {
        await _redis.KeyDeleteAsync(key);
    }

    public async Task EntityChanged(string[] Queries)
    {
        foreach (var query in Queries)
        {
            var result = _redisServer.Keys(pattern: $"{CachePrefix}*{query}");
            await _redis.KeyDeleteAsync(result.ToArray());
        }
    }
}