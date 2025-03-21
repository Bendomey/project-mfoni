using main.Configuratons;
using Microsoft.Extensions.Options;
using MongoDB.Driver;
using main.DTOs;
using System.Text;
using System.Security.Claims;
using System.IdentityModel.Tokens.Jwt;
using Microsoft.IdentityModel.Tokens;
using main.Configurations;
using main.Lib;

namespace main.Domains;

public class UserAuth
{
    private readonly ILogger<UserAuth> _logger;
    private readonly IMongoCollection<Models.User> _usersCollection;
    private readonly AppConstants _appConstantsConfiguration;

    public UserAuth(ILogger<UserAuth> logger, DatabaseSettings databaseConfig, IOptions<AppConstants> appConstants)
    {
        _logger = logger;

        var database = databaseConfig.Database;

        _usersCollection = database.GetCollection<Models.User>(appConstants.Value.UserCollection);

        _appConstantsConfiguration = appConstants.Value;

        _logger.LogDebug("AuthService initialized");
    }

    public AuthenticateResponse Authenticate(AuthenticateInput input)
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
                    throw new HttpRequestException("UserAlreadyExistsWithAnotherProvider");
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

            _usersCollection.InsertOne(__user);

            // if email exists send them verification email
            if (input.Email is not null)
            {
                // send verification email
                _logger.LogInformation("Sending Verification Email");
                var _ = EmailConfiguration.Send(new SendEmailInput
                {
                    From = _appConstantsConfiguration.EmailFrom,
                    Email = input.Email,
                    Subject = EmailTemplates.VerificationEmailSubject,
                    Message = EmailTemplates.VerificationEmailBody
                        .Replace("{name}", input.Name)
                        .Replace("{verificationLink}", $"{_appConstantsConfiguration.WebsiteUrl}/account/verify"),
                    ApiKey = _appConstantsConfiguration.ResendApiKey
                });
            }

        }

        if (__user is not null)
        {
            return new AuthenticateResponse
            {
                Token = generateToken(__user),
                User = __user,
            };
        }

        throw new HttpRequestException("UserNotFound");
    }

    public Models.User? Me(CurrentUserOutput userInput)
    {

        var user = _usersCollection.Find<Models.User>(user => user.Id == userInput.Id).FirstOrDefault();

        if (user is null)
        {
            throw new HttpRequestException("UserNotFound");
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
                new Claim(ClaimTypes.Role, "USER"),
            }),
            Issuer = _appConstantsConfiguration.JwtIssuer,
            Audience = _appConstantsConfiguration.JwtIssuer,
            SigningCredentials = new SigningCredentials(new SymmetricSecurityKey(key), SecurityAlgorithms.HmacSha256Signature)
        };

        var token = tokenHandler.CreateToken(tokenDescriptor);
        return tokenHandler.WriteToken(token);
    }
}