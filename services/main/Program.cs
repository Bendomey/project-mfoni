using Microsoft.OpenApi.Models;
using main.Domains;
using main.HostedServices;
using main.Configuratons;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.Text;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.Configure<RabbitMQConnection>(
    builder.Configuration.GetSection("RabbitMQConnection"));

builder.Services.Configure<AppConstants>(
    builder.Configuration.GetSection("AppConstants"));

var userSecretKey = builder.Configuration.GetSection("AppConstants:UserJwtSecret").Get<string>();

builder.Services.AddStackExchangeRedisCache(options =>
{
    options.Configuration = builder.Configuration.GetSection("AppConstants:RedisConnectionString").Get<string>();
});

builder.Services.AddAuthentication(options =>
    {
        options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
        options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
        options.DefaultScheme = JwtBearerDefaults.AuthenticationScheme;
    }).AddJwtBearer(options =>
     {
         options.TokenValidationParameters = new TokenValidationParameters
         {
             IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(builder.Configuration["AppConstants:UserJwtSecret"]!)),
             ValidIssuer = builder.Configuration["AppConstants:JwtIssuer"],
             ValidAudience = builder.Configuration["AppConstants:JwtIssuer"],
             ValidateIssuer = true,
             ValidateAudience = true,
             ValidateLifetime = false,
             ValidateIssuerSigningKey = true
         };
     });

builder.Services.AddAuthorization();

// configurations
builder.Services.AddSingleton<DatabaseSettings>();
builder.Services.AddSingleton<RabbitMQConnection>();
builder.Services.AddSingleton<CacheProvider>();

// auth services
builder.Services.AddSingleton<Auth>();
builder.Services.AddSingleton<UserService>();

// search services
builder.Services.AddSingleton<SearchTag>();
builder.Services.AddSingleton<SearchContent>();

builder.Services.AddSingleton<SaveTags>();

// indexing content services
builder.Services.AddSingleton<IndexContent>();
builder.Services.AddSingleton<ProcessIndexContent>();

// hosted services.
builder.Services.AddHostedService<ConsumerHostedService>();

builder.Services.AddControllers();
// Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(options =>
{
    options.SwaggerDoc("v1", new OpenApiInfo
    {
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

// app.UseHttpsRedirection();

// @TODO: secure based on our frontend setup.
app.UseCors(builder => builder
    .AllowAnyOrigin()
    .AllowAnyMethod()
    .AllowAnyHeader());

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

app.MapGet("/", () => "All Green!");

app.Run();
