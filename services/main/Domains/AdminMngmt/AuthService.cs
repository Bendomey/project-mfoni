using main.DTOs;
using MongoDB.Driver;
using main.Configuratons;
using Microsoft.Extensions.Options;
using Microsoft.AspNetCore.Identity;
using System.IdentityModel.Tokens.Jwt;
using System.Text;
using System.Security.Claims;
using Microsoft.IdentityModel.Tokens;

namespace main.Domains;

public class AdminAuthService
{
    private readonly AppConstants _appConstantsConfiguration;
    private readonly IMongoCollection<Models.Admin> _adminsCollection;
    public AdminAuthService(DatabaseSettings databaseConfig, IOptions<AppConstants> appConstants)
    {

        var database = databaseConfig.Database;
        _adminsCollection = database.GetCollection<Models.Admin>(appConstants.Value.AdminCollection);
        _appConstantsConfiguration = appConstants.Value;

    }

    public AdminAuthenticateResponse Authenticate(LoginAdminInput input)
    {
        var __admin = _adminsCollection.Find(admin => admin.Email == input.Email).FirstOrDefault();

        if (__admin is null)
        {
            throw new HttpRequestException("AdminNotFound");
        }

        // compare password hashes
        var passwordHasher = new PasswordHasher<Models.Admin>();
        if (passwordHasher.VerifyHashedPassword(__admin, __admin.Password, input.Password) == PasswordVerificationResult.Failed)
        {
            throw new HttpRequestException("InvalidPassword");
        }

        return new AdminAuthenticateResponse
        {
            Token = generateToken(__admin),
            Admin = __admin,
        };
    }

    private string generateToken(Models.Admin admin)
    {
        var tokenHandler = new JwtSecurityTokenHandler();
        var key = Encoding.ASCII.GetBytes(_appConstantsConfiguration.AdminJwtSecret);
        var tokenDescriptor = new SecurityTokenDescriptor
        {
            Subject = new ClaimsIdentity(new Claim[]
            {
                new Claim("id", admin.Id.ToString()),
                new Claim(ClaimTypes.Role, "ADMIN"),
            }),
            Issuer = _appConstantsConfiguration.JwtIssuer,
            Audience = _appConstantsConfiguration.JwtIssuer,
            SigningCredentials = new SigningCredentials(new SymmetricSecurityKey(key), SecurityAlgorithms.HmacSha256Signature)
        };

        var token = tokenHandler.CreateToken(tokenDescriptor);
        return tokenHandler.WriteToken(token);
    }
}