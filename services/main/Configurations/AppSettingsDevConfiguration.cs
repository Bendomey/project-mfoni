namespace main.Configurations;

public class AppSettingsDevConfiguration
{
    public static IConfiguration Configuration { get; private set; } = default!;

    public static IConfiguration DevConfig()
    {
        Configuration = new ConfigurationBuilder()
            .SetBasePath(Directory.GetCurrentDirectory())
            .AddJsonFile("appsettings.Development.json", optional: true, reloadOnChange: true)
            .Build();

        return Configuration;
    }
}
