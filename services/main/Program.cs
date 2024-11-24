using System.Reflection;
using System.Text;
using main.Configuratons;
using main.Domains;
using main.HostedServices;
using main.Transformations;
using Microsoft.AspNetCore.Authorization;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.Configure<RabbitMQConnection>(
    builder.Configuration.GetSection("RabbitMQConnection")
);

builder.Services.Configure<AppConstants>(builder.Configuration.GetSection("AppConstants"));

builder.Services.AddStackExchangeRedisCache(options =>
{
    options.Configuration = builder
        .Configuration.GetSection("AppConstants:RedisConnectionString")
        .Get<string>();
});

builder
    .Services.AddAuthentication()
    .AddJwtBearer(
        "USER",
        options =>
        {
            options.TokenValidationParameters = new TokenValidationParameters
            {
                IssuerSigningKey = new SymmetricSecurityKey(
                    Encoding.UTF8.GetBytes(builder.Configuration["AppConstants:UserJwtSecret"]!)
                ),
                ValidIssuer = builder.Configuration["AppConstants:JwtIssuer"],
                ValidAudience = builder.Configuration["AppConstants:JwtIssuer"],
                ValidateIssuer = true,
                ValidateAudience = true,
                ValidateLifetime = false,
                ValidateIssuerSigningKey = true
            };
        }
    )
    .AddJwtBearer(
        "ADMIN",
        options =>
        {
            options.TokenValidationParameters = new TokenValidationParameters
            {
                IssuerSigningKey = new SymmetricSecurityKey(
                    Encoding.UTF8.GetBytes(builder.Configuration["AppConstants:AdminJwtSecret"]!)
                ),
                ValidIssuer = builder.Configuration["AppConstants:JwtIssuer"],
                ValidAudience = builder.Configuration["AppConstants:JwtIssuer"],
                ValidateIssuer = true,
                ValidateAudience = true,
                ValidateLifetime = true,
                ValidateIssuerSigningKey = true
            };
        }
    );

builder.Services.AddAuthorization(options =>
{
    options.DefaultPolicy = new AuthorizationPolicyBuilder()
        .RequireAuthenticatedUser()
        .AddAuthenticationSchemes("USER")
        .Build();

    options.AddPolicy(
        "Admin",
        new AuthorizationPolicyBuilder()
            .RequireAuthenticatedUser()
            .AddAuthenticationSchemes("ADMIN")
            .Build()
    );
});

// configurations
builder.Services.AddSingleton<DatabaseSettings>();
builder.Services.AddSingleton<RabbitMQConnection>();
builder.Services.AddSingleton<CacheProvider>();

// admin services
builder.Services.AddSingleton<AdminAuthService>();
builder.Services.AddSingleton<AdminService>();
builder.Services.AddSingleton<SearchAdmin>();
builder.Services.AddSingleton<AdminWalletService>();

// user services
builder.Services.AddSingleton<UserAuth>();
builder.Services.AddSingleton<UserService>();
builder.Services.AddSingleton<CreatorApplicationService>();
builder.Services.AddSingleton<CreatorService>();

// billing services
builder.Services.AddSingleton<WalletService>();
builder.Services.AddSingleton<SubscriptionService>();

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
builder.Services.AddSingleton<UserTransformer>();
builder.Services.AddSingleton<CreatorApplicationTransformer>();
builder.Services.AddSingleton<CreatorTransformer>();
builder.Services.AddSingleton<CreatorSubscriptionTransformer>();

// hosted services.
builder.Services.AddHostedService<ConsumerHostedService>();
builder.Services.AddHostedService<StartUpService>();
builder.Services.AddHostedService<SubscriptionProcessorCron>();

builder.Services.AddControllers();

// Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(options =>
{
    options.SwaggerDoc("v1", new OpenApiInfo { Title = "Mfoni API", Version = "v1" });
    var xmlFilename = $"{Assembly.GetExecutingAssembly().GetName().Name}.xml";
    options.IncludeXmlComments(Path.Combine(AppContext.BaseDirectory, xmlFilename));

    options.AddSecurityDefinition(
        "Bearer",
        new OpenApiSecurityScheme
        {
            In = ParameterLocation.Header,
            Description = "Please enter a valid token",
            Name = "Authorization",
            Type = SecuritySchemeType.Http,
            BearerFormat = "JWT",
            Scheme = "Bearer"
        }
    );
    options.AddSecurityRequirement(
        new OpenApiSecurityRequirement
        {
            {
                new OpenApiSecurityScheme
                {
                    Reference = new OpenApiReference
                    {
                        Type = ReferenceType.SecurityScheme,
                        Id = "Bearer"
                    }
                },
                new string[] { }
            }
        }
    );
});

var app = builder.Build();

// Configure the HTTP request pipeline.
if (builder.Configuration["AppConstants:RegisterSwaggerDocs"] == "true")
{
    app.UseSwagger();
    app.UseSwaggerUI();
}


// app.UseHttpsRedirection();

// @TODO: secure based on our frontend setup.
app.UseCors(builder => builder.AllowAnyOrigin().AllowAnyMethod().AllowAnyHeader());

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

app.MapGet("/", () => "All Green!");

app.Run();
