using main.Configuratons;
using Microsoft.Extensions.Options;
using MongoDB.Driver;
using main.DTOs;
using System.Text;
using System.Security.Claims;
using System.IdentityModel.Tokens.Jwt;
using Microsoft.IdentityModel.Tokens;
using main.Models;

namespace main.Domains;

public class Auth
{
    private readonly ILogger<SaveTags> _logger;
    private readonly IMongoCollection<Models.User> _usersCollection;
    private readonly IMongoCollection<Models.CreatorApplication> _creatorsCollection;
    private readonly AppConstants _appConstantsConfiguration;

    public Auth(ILogger<SaveTags> logger, DatabaseSettings databaseConfig, IOptions<AppConstants> appConstants)
    {
        _logger = logger;

        var database = databaseConfig.Database;

        _usersCollection = database.GetCollection<Models.User>(appConstants.Value.UserCollection);

        _creatorsCollection = database.GetCollection<Models.CreatorApplication>(appConstants.Value.CreatorApplicatonCollection);

        _appConstantsConfiguration = appConstants.Value;

        _logger.LogDebug("AuthService initialized");
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

    public bool SetupAccount(SetupAccountInput accountInput, CurrentUserOutput userInput)
    {
        var user = _usersCollection.Find<Models.User>(user => user.Id == userInput.Id).FirstOrDefault();

        if (user is null)
        {
            throw new Exception("UserNotFound");
        }

        var checkIfUsernameExists = _usersCollection.Find<Models.User>(user => user.Username == accountInput.Username).FirstOrDefault();

        if (checkIfUsernameExists is not null)
        {
            throw new Exception("UsernameAlreadyTaken");
        }

        user.Name = accountInput.Name;
        user.Username = accountInput.Username;
        user.AccountSetupAt = DateTime.UtcNow;
        user.UpdatedAt = DateTime.UtcNow;


        if (accountInput.Role == UserRole.CREATOR && user.CreatorApplication is null)
        {
            var __newCreatorApplication = new Models.CreatorApplication { };
            _creatorsCollection.InsertOne(__newCreatorApplication);

            user.CreatorApplicationId = __newCreatorApplication.Id;
        }

        _usersCollection.ReplaceOne(user => user.Id == userInput.Id, user);
        return true;
    }

    public Models.User? Me(CurrentUserOutput userInput)
    {
        // TODO: make aggregate query to get user with creator application
        // var pipeline = _usersCollection
        //     .Aggregate()
        //     .Match(user => user.Id == userInput.Id)
        //     .Lookup<Models.User, Models.CreatorApplication, Models.User>(
        //         foreignCollection: _creatorsCollection,
        //         localField: user => user.CreatorApplicationId,
        //         foreignField: creator => creator.Id,
        //         //  @as: (user, creatorApplications) => new Models.UserWithCreatorApplication
        //         //  {
        //         //      CreatorApplication = user,
        //         //      User = creatorApplications.FirstOrDefault()
        //         //  }
        //     );

        // var users = pipeline.ToList();

        // if (users.Count == 0)
        // {
        //     throw new Exception("UserNotFound");
        // }

        // return users[0];
         var user = _usersCollection.Find<Models.User>(user => user.Id == userInput.Id).FirstOrDefault();

        if (user is null)
        {
            throw new Exception("UserNotFound");
        }

        if (user.CreatorApplicationId is not null)
        {
            var creatorApplication = _creatorsCollection.Find<Models.CreatorApplication>(creator => creator.Id == user.CreatorApplicationId).FirstOrDefault();
            user.CreatorApplication = creatorApplication;
        }

        return user;
    }

    private string generateToken(Models.User user)
    {
        var tokenHandler = new JwtSecurityTokenHandler();
        var key = Encoding.ASCII.GetBytes(_appConstantsConfiguration.UserJwtSecret);
        var tokenDescriptor = new SecurityTokenDescriptor
        {
            Subject = new ClaimsIdentity(new Claim[]
            {
                new Claim("id", user.Id.ToString()),
                new Claim(ClaimTypes.Role, "USER"), // Either a USER or ADMIN
            }),
            Issuer = _appConstantsConfiguration.JwtIssuer,
            Audience = _appConstantsConfiguration.JwtIssuer,
            SigningCredentials = new SigningCredentials(new SymmetricSecurityKey(key), SecurityAlgorithms.HmacSha256Signature)
        };

        var token = tokenHandler.CreateToken(tokenDescriptor);
        return tokenHandler.WriteToken(token);
    }
}