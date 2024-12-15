using System.Net;
using System.Text.Json;
using main.Configuratons;

namespace main.Middlewares;

public class E2ECacheLayer
{

    private readonly RequestDelegate _next;
    private readonly ILogger<E2ECacheLayer> _logger;
    private readonly CacheProvider _cacheProvider;

    public E2ECacheLayer(RequestDelegate next, ILogger<E2ECacheLayer> logger, CacheProvider cacheProvider)
    {
        _next = next;
        _logger = logger;
        _cacheProvider = cacheProvider;
    }

    public async Task InvokeAsync(HttpContext context)
    {

        // Store the original response body stream
        var originalBodyStream = context.Response.Body;

        // Create a new memory stream to replace the response body
        using (var memoryStream = new MemoryStream())
        {
            // Replace the response body with the memory stream
            context.Response.Body = memoryStream;

            try
            {
                var cacheKey = "";

                // we only try to retrieve the cache if the request is a GET request
                if (context.Request.Method == "GET")
                {
                    // build a string with the query parameters and values like so - key|value|key|value
                    var queryParameters = context.Request.Query.Select(q => $"{q.Key}|{q.Value}").ToList();
                    var strigifiedQueryParameters = string.Join("|", queryParameters);

                    // with url structure like /api/v1/entity/action?queryParameters
                    if (context.Request.Path.Value is not null)
                    {
                        var urlEntity = context.Request.Path.Value.Split("/")[3];
                        var entity = CacheProvider.CacheEntities[urlEntity];

                        var action = "find";
                        if (context.Request.Path.Value.Split("/").Length > 3)
                        {
                            var restOfPath = context.Request.Path.Value.Replace($"/api/v1/{urlEntity}", "");
                            if (!string.IsNullOrEmpty(restOfPath))
                            {
                                action = restOfPath.Remove(0, 1).Replace("/", "_");
                            }
                        }

                        // we only cache entities we are interested in.
                        if (entity is not null)
                        {
                            // build the cache key from the request with structure like mfoni-entity.action:queryParameters
                            cacheKey = $"{entity}.{action}:{strigifiedQueryParameters}";
                            var cacheHitData = await _cacheProvider.GetFromCache<object>(cacheKey);

                            if (cacheHitData is not null)
                            {
                                _logger.LogInformation("E2ECacheLayer Middleware::Cache Hit: {CacheKey}", cacheKey);
                                if (CacheProvider.CacheTTL is not null)
                                {
                                    _ = _cacheProvider.SetCache(cacheKey, cacheHitData, CacheProvider.CacheTTL);
                                }

                                // if we have a cache hit, we return the cached data
                                context.Response.StatusCode = (int)HttpStatusCode.OK;
                                context.Response.ContentType = "application/json";

                                // Reset the memory stream for writing back to the response
                                memoryStream.SetLength(0);
                                await memoryStream.WriteAsync(System.Text.Encoding.UTF8.GetBytes(JsonSerializer.Serialize(cacheHitData)));
                                memoryStream.Seek(0, SeekOrigin.Begin);

                                // Copy the modified response back to the original response stream
                                await memoryStream.CopyToAsync(originalBodyStream);

                                return;
                            }

                            // if there's a cache miss, we move on to the next middleware inline until the request cycle is completed.
                            _logger.LogInformation("E2ECacheLayer Middleware::Cache Miss: {CacheKey}", cacheKey);
                        }
                    }

                }

                // Call the next middleware in the pipeline
                await _next(context);

                // Ensure the memory stream is readable
                memoryStream.Seek(0, SeekOrigin.Begin);

                // Read the original response
                var responseBody = await new StreamReader(memoryStream).ReadToEndAsync();

                if (!string.IsNullOrEmpty(cacheKey))
                {
                    // if the request is a GET request and the response status code is 200, we cache the response
                    if (context.Request.Method == "GET" && context.Response.StatusCode == (int)HttpStatusCode.OK)
                    {
                        await _cacheProvider.SetCache(cacheKey, responseBody, CacheProvider.CacheTTL);
                        _logger.LogInformation("E2ECacheLayer Middleware::Cache Set: {CacheKey}", cacheKey);
                    }
                }

                // Reset the memory stream for writing back to the response
                memoryStream.SetLength(0);
                await memoryStream.WriteAsync(System.Text.Encoding.UTF8.GetBytes(responseBody));
                memoryStream.Seek(0, SeekOrigin.Begin);

                // Copy the modified response back to the original response stream
                await memoryStream.CopyToAsync(originalBodyStream);
            }
            finally
            {
                // Restore the original response stream
                context.Response.Body = originalBodyStream;
            }
        }

    }
}
