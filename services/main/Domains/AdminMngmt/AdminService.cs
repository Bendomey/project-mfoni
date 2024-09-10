using System.Net;
using main.Configurations;
using main.Configuratons;
using main.DTOs;
using main.Lib;
using main.Models;
using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.Options;
using MongoDB.Driver;
using NanoidDotNet;

namespace main.Domains;

public class AdminService
{
    private readonly AppConstants _appConstantsConfiguration;
    private readonly IMongoCollection<Models.Admin> _adminsCollection;

    public AdminService(DatabaseSettings databaseConfig, IOptions<AppConstants> appConstants)
    {
        var database = databaseConfig.Database;
        _adminsCollection = database.GetCollection<Models.Admin>(
            appConstants.Value.AdminCollection
        );
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
        var _ = EmailConfiguration.Send(
            new SendEmailInput
            {
                From = _appConstantsConfiguration.EmailFrom,
                Email = input.Email,
                Subject = EmailTemplates.NewAdminSubject,
                Message = EmailTemplates
                    .NewAdminBody.Replace("{name}", input.Name)
                    .Replace("{email}", input.Email)
                    .Replace("{password}", password),
                ApiKey = _appConstantsConfiguration.ResendApiKey
            }
        );

        return __newAdmin;
    }

    public async Task<Models.Admin> UpdatePassword(string id, UpdatePasswordInput input)
    {
        Admin _admin = _adminsCollection.Find(admin => admin.Id == id).FirstOrDefault();
        if (_admin is null)
        {
            throw new HttpRequestException(
                "Admin not found",
                inner: default,
                statusCode: HttpStatusCode.BadRequest
            );
        }

        var passwordHasher = new PasswordHasher<Admin>();
        if (
            passwordHasher.VerifyHashedPassword(_admin, _admin.Password, input.OldPassword)
            == PasswordVerificationResult.Failed
        )
        {
            throw new HttpRequestException("Invalid password. Try again");
        }

        if (input.OldPassword == input.NewPassword)
        {
            throw new HttpRequestException("Passwords are identical. Choose a different password");
        }

        string newPassword = passwordHasher.HashPassword(_admin, input.NewPassword);

        _admin.Password = newPassword;
        await _adminsCollection.ReplaceOneAsync(admin => admin.Id == id, _admin);

        return _admin;
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
