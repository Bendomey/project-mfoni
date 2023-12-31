using Microsoft.OpenApi.Models;
using main.Domains;
using main.HostedServices;
using main.Configuratons;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.Configure<DatabaseSettings>(
    builder.Configuration.GetSection("Database"));

builder.Services.Configure<RabbitMQConnection>(
    builder.Configuration.GetSection("RabbitMQConnection"));

builder.Services.Configure<AppConstants>(
    builder.Configuration.GetSection("AppConstants"));

// search services
builder.Services.AddSingleton<SearchTag>();
builder.Services.AddSingleton<SearchContent>();

builder.Services.AddSingleton<SaveTags>();

// indexing content services
builder.Services.AddSingleton<IndexContent>();
builder.Services.AddSingleton<ProcessIndexContent>();

builder.Services.AddHostedService<ConsumerHostedService>();

builder.Services.AddControllers();
// Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(options => {
        options.SwaggerDoc("v1", new OpenApiInfo {
        Title = "Mfoni API",
        Version = "v1"
    });
});

var app = builder.Build();

// Configure the HTTP request pipeline.
if (!app.Environment.IsProduction())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();

// @TODO: secure based on our frontend setup.
app.UseCors(builder => builder
    .AllowAnyOrigin()
    .AllowAnyMethod()
    .AllowAnyHeader());

app.UseAuthorization();

app.MapControllers();

app.MapGet("/", () => "All Green!");

app.Run();
