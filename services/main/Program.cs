using Microsoft.OpenApi.Models;
using main.Domains;
using main.Transformations;
using main.HostedServices;
using main.Configuratons;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using Microsoft.AspNetCore.Authorization;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.Configure<RabbitMQConnection>(
    builder.Configuration.GetSection("RabbitMQConnection"));

builder.Services.Configure<AppConstants>(
    builder.Configuration.GetSection("AppConstants"));

builder.Services.AddStackExchangeRedisCache(options =>
{
    options.Configuration = builder.Configuration.GetSection("AppConstants:RedisConnectionString").Get<string>();
});

builder.Services.AddAuthentication().AddJwtBearer("USER", options =>
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
     }).AddJwtBearer("ADMIN", options =>
     {
         options.TokenValidationParameters = new TokenValidationParameters
         {
             IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(builder.Configuration["AppConstants:AdminJwtSecret"]!)),
             ValidIssuer = builder.Configuration["AppConstants:JwtIssuer"],
             ValidAudience = builder.Configuration["AppConstants:JwtIssuer"],
             ValidateIssuer = true,
             ValidateAudience = true,
             ValidateLifetime = true,
             ValidateIssuerSigningKey = true
         };
     });

builder.Services.AddAuthorization(options =>
{
    options.DefaultPolicy = new AuthorizationPolicyBuilder()
            .RequireAuthenticatedUser()
            .AddAuthenticationSchemes("USER")
            .Build();

    options.AddPolicy("Admin", new AuthorizationPolicyBuilder()
                .RequireAuthenticatedUser()
                .AddAuthenticationSchemes("ADMIN")
                .Build());
});

// configurations
builder.Services.AddSingleton<DatabaseSettings>();
builder.Services.AddSingleton<RabbitMQConnection>();
builder.Services.AddSingleton<CacheProvider>();

// admin services
builder.Services.AddSingleton<AdminAuthService>();
builder.Services.AddSingleton<AdminService>();

// user services
builder.Services.AddSingleton<UserAuth>();
builder.Services.AddSingleton<UserService>();

// search services
builder.Services.AddSingleton<SearchTag>();
builder.Services.AddSingleton<SearchContent>();

builder.Services.AddSingleton<SaveTags>();

builder.Services.AddSingleton<CollectionService>();
builder.Services.AddSingleton<CollectionContentService>();

// indexing content services
builder.Services.AddSingleton<IndexContent>();
builder.Services.AddSingleton<ProcessIndexContent>();

builder.Services.AddSingleton<WaitlistService>();

// inject transformers
builder.Services.AddSingleton<AdminTransformer>();

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
