using MongoDB.Driver;
using main.Configuratons;
using Microsoft.Extensions.Options;
using Microsoft.AspNetCore.Identity;
using NanoidDotNet;
using main.Configurations;
using main.Lib;

namespace main.Domains;

public class AdminService
{
    private readonly AppConstants _appConstantsConfiguration;
    private readonly IMongoCollection<Models.Admin> _adminsCollection;
    public AdminService(DatabaseSettings databaseConfig, IOptions<AppConstants> appConstants)
    {

        var database = databaseConfig.Database;
        _adminsCollection = database.GetCollection<Models.Admin>(appConstants.Value.AdminCollection);
        _appConstantsConfiguration = appConstants.Value;
    }

    public async Task<Models.Admin> Create(CreateAdminInput input)
    {
        var __admin = _adminsCollection.Find(admin => admin.Email == input.Email).FirstOrDefault();

        if (__admin is not null)
        {
            throw new HttpRequestException("AdminAlreadyExists");
        }

        var password = Nanoid.Generate("1234567890qwertyuiopasdfghjklzxcvbnm", 10);
        var __newAdmin = new Models.Admin
        {
            Name = input.Name,
            Email = input.Email,
            Password = password,
            CreatedById = input.CreatedBy
        };

        var passwordHasher = new PasswordHasher<Models.Admin>();
        __newAdmin.Password = passwordHasher.HashPassword(__newAdmin, password);
        await _adminsCollection.InsertOneAsync(__newAdmin);

        // send password to email
        var _ = EmailConfiguration.Send(new SendEmailInput
        {
            From = _appConstantsConfiguration.EmailFrom,
            Email = input.Email,
            Subject = EmailTemplates.NewAdminSubject,
            Message = EmailTemplates.NewAdminBody.Replace("{name}", input.Name).Replace("{email}", input.Email).Replace("{password}", password),
            ApiKey = _appConstantsConfiguration.ResendApiKey
        });

        return __newAdmin;
    }

    public Models.Admin? GetAdminById(string id)
    {
        var __admin = _adminsCollection.Find(admin => admin.Id == id).FirstOrDefault();

        if (__admin is null)
        {
            throw new HttpRequestException("AdminNotFound");
        }

        return __admin;
    }

}