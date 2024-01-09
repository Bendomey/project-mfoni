using main.Configuratons;
using Microsoft.Extensions.Options;
using MongoDB.Driver;
using main.DTOs;
using System.Text;
using System.Security.Claims;
using System.IdentityModel.Tokens.Jwt;
using Microsoft.IdentityModel.Tokens;

namespace main.Domains;

public class Auth
{
    private readonly ILogger<SaveTags> _logger;
    private readonly IMongoCollection<Models.User> _usersCollection;
    private readonly AppConstants _appConstantsConfiguration;

    public Auth(ILogger<SaveTags> logger, IOptions<DatabaseSettings> mfoniStoreDatabaseSettings, IOptions<AppConstants> appConstants)
    {
        _logger = logger;

        var database = connectToDatabase(mfoniStoreDatabaseSettings);

        _usersCollection = database.GetCollection<Models.User>(appConstants.Value.UserCollection);

        _appConstantsConfiguration = appConstants.Value;

        _logger.LogDebug("AuthService initialized");
    }

    private IMongoDatabase connectToDatabase(IOptions<DatabaseSettings> mfoniStoreDatabaseSettings)
    {
        var client = new MongoClient(mfoniStoreDatabaseSettings.Value.ConnectionString);
        return client.GetDatabase(mfoniStoreDatabaseSettings.Value.DatabaseName);
    }

    public AuthenticateResponse? Authenticate(AuthenticateInput input)
    {
        // check if user exists by verifying oauthId
        var __user = _usersCollection.Find<Models.User>(user => user.OAuthId == input.Uid).FirstOrDefault();
        if (__user is null)
        {

            if (input.Email is not null)
            {
                // check if user exists by verifying email
                _logger.LogInformation("User Not found, Checking if Email Exists");
                __user = _usersCollection.Find<Models.User>(user => user.Email == input.Email).FirstOrDefault();

                if (__user is not null)
                {
                    throw new Exception("UserAlreadyExistsWithAnotherProvider");
                }
            }
            
            // create new user
            __user = new Models.User
            {
                Provider = input.Provider,
                OAuthId = input.Uid,
                Name = input.Name,
                Email = input.Email,
                Photo = input.UserPhoto
            };

            _logger.LogInformation("Creating new user: " + __user);
            _usersCollection.InsertOne(__user);
        }

        if (__user is not null)
        {
            return new AuthenticateResponse
            {
                Token = generateToken(__user),
                User = __user,
            };
        }

        return null;
    }

    private string generateToken(Models.User user)
    {
        var tokenHandler = new JwtSecurityTokenHandler();
        var key = Encoding.ASCII.GetBytes(_appConstantsConfiguration.UserJwtSecret);
        var tokenDescriptor = new SecurityTokenDescriptor
        {
            Subject = new ClaimsIdentity(new Claim[]
            {
                new Claim(ClaimTypes.Name, user.Id.ToString()),
                new Claim(ClaimTypes.Role, "USER"), // Either a USER or ADMIN
            }),
            Issuer = "mfoni.com",
            Expires = DateTime.UtcNow.AddDays(7),
            SigningCredentials = new SigningCredentials(new SymmetricSecurityKey(key), SecurityAlgorithms.HmacSha256Signature)
        };

        var token = tokenHandler.CreateToken(tokenDescriptor);
        return tokenHandler.WriteToken(token);
    }
}