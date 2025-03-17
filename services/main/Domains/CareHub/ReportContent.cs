using main.Configuratons;
using Microsoft.Extensions.Options;
using MongoDB.Driver;
using main.DTOs;
using NanoidDotNet;
using Amazon.Runtime.SharedInterfaces;
using main.Models;
using System.Threading.Tasks;
using main.Configurations;
using main.Lib;

namespace main.Domains;

public class ReportContentCaseService
{
    private readonly ILogger<ReportContentCaseService> _logger;
    private readonly AppConstants _appConstantsConfiguration;
    private readonly IMongoCollection<Models.ReportContentCase> _reportContentCaseCollection;
    private readonly SearchTagService _searchTagService;
    private readonly SearchContentService _searchContentService;
    private readonly CollectionService _collectionService;
    private readonly UserService _userService;
    private readonly CacheProvider _cacheProvider;

    public ReportContentCaseService(
        ILogger<ReportContentCaseService> logger,
        DatabaseSettings databaseConfig,
        IOptions<AppConstants> appConstants,
        SearchTagService searchTagService,
        SearchContentService searchContentService,
        CacheProvider cacheProvider,
        CollectionService collectionService,
        UserService userService
    )
    {
        _logger = logger;
        _appConstantsConfiguration = appConstants.Value;

        var database = databaseConfig.Database;

        _reportContentCaseCollection = database.GetCollection<Models.ReportContentCase>(appConstants.Value.ContentReportCaseCollection);

        _searchTagService = searchTagService;
        _collectionService = collectionService;
        _searchContentService = searchContentService;
        _userService = userService;

        _cacheProvider = cacheProvider;

        _logger.LogDebug("ReportContentCaseService initialized");
    }

    public async Task<Models.ReportContentCase> Submit(SubmitContentReportInput input)
    {
        var name = input.Name;
        var email = input.Email;
        var phone = input.Phone;

        // check if user exists
        if (input.UserId is not null)
        {
            var user = await _userService.GetUserById(input.UserId);

            if (user is not null)
            {
                name = user.Name;
                email = user.Email;
                phone = user.PhoneNumber;
            }
        }

        if (name is null || (email is null && phone is null))
        {
            throw new HttpRequestException("UserInfoNotProvided");
        }

        string? contentName = null;
        string? contentId = null;
        // check if content exists
        if (input.ContentType == ReportContentCaseType.COLLECTION)
        {
            var collection = _collectionService.GetCollectionBySlug(input.ContentSlug);
            if (collection is not null)
            {
                contentId = collection.Id;
                contentName = collection.Name;
            }
        }
        else if (input.ContentType == ReportContentCaseType.IMAGE)
        {
            var image = await _searchContentService.GetContentBySlug(input.ContentSlug);
            if (image is not null)
            {
                contentId = image.Id;
                contentName = image.Title;
            }
        }
        else if (input.ContentType == ReportContentCaseType.TAG)
        {
            var tag = _searchTagService.GetBySlug(input.ContentSlug);
            if (tag is not null)
            {
                contentId = tag.Id;
                contentName = tag.Name;
            }
        }

        if (contentId == null)
        {
            throw new HttpRequestException("Content not found");
        }

        // generate case number
        var caseNumber = await GenerateCaseNumber();

        // create report case
        var reportCase = new Models.ReportContentCase
        {
            CaseNumber = caseNumber,
            ContentId = contentId,
            ContentType = input.ContentType,
            ReasonForReport = input.ReasonForReport,
            BreakingLocalLaws = input.BreakingLocalLaws,
            AdditionalDetails = input.AdditionalDetails,
            CreatedById = input.UserId,
            Name = input.Name,
            Phone = input.Phone,
            Email = input.Email,
        };

        await _reportContentCaseCollection.InsertOneAsync(reportCase);


        // send notifications to user
        SendNotification(
            subject: EmailTemplates.ContentReportedSubject
                .Replace("{caseNumber}", caseNumber),
            body: EmailTemplates.ContentReportedBody
                .Replace("{caseNumber}", caseNumber)
                .Replace("{name}", StringLib.SafeString(name))
                .Replace("{contentName}", StringLib.SafeString(contentName))
                .Replace("{reason}", StringLib.NormalizeReportContentReason(input.ReasonForReport, input.AdditionalDetails))
                .Replace("{submissionDate}", reportCase.CreatedAt.ToString("dd/MM/yyyy hh:mm tt")),
            email: StringLib.SafeString(email),
            phone: StringLib.SafeString(phone)
        );

        return reportCase;

    }

    private async Task<string> GenerateCaseNumber()
    {
        var today = DateTime.Now.ToString("yyyyMMdd");
        var randGen = Nanoid.Generate("ABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890", 10);

        var caseNumber = $"{randGen}{today}";

        var caseNumberExist = await _reportContentCaseCollection.Find(x => x.CaseNumber == caseNumber).FirstOrDefaultAsync();
        if (caseNumberExist is not null)
        {
            return await GenerateCaseNumber();
        }

        return caseNumber;
    }

    public async Task<Models.ReportContentCase> Acknowledge(AcknowledgeContentReportInput input)
    {
        var reportCase = await GetCaseById(input.ReportContentCaseId);

        if (reportCase.Status != ReportContentCaseStatus.SUBMITTED)
        {
            string status = char.ToUpper(reportCase.Status[0]) + reportCase.Status.Substring(1).ToLower();
            throw new HttpRequestException($"ReportCaseIs{status}");
        }

        await _reportContentCaseCollection.UpdateOneAsync(
            x => x.Id == input.ReportContentCaseId,
            Builders<Models.ReportContentCase>.Update
                .Set(x => x.Status, ReportContentCaseStatus.ACKNOWLEDGED)
                .Set(x => x.AcknowledgedAt, DateTime.Now)
                .Set(x => x.AcknowledgedById, input.AdminId)
                .Set(x => x.UpdatedAt, DateTime.Now)
        );

        // send notifications to user
        var name = reportCase.Name;
        var email = reportCase.Email;
        var phone = reportCase.Phone;

        if (reportCase.CreatedById is not null)
        {
            var user = await _userService.GetUserById(reportCase.CreatedById);
            if (user is not null)
            {
                name = user.Name;
                email = user.Email;
                phone = user.PhoneNumber;
            }
        }

        var contentName = await this.ResolveContentName(reportCase.ContentId, reportCase.ContentType);

        SendNotification(
            subject: EmailTemplates.ContentReportAcknowledgedSubject
                .Replace("{caseNumber}", reportCase.CaseNumber),
            body: EmailTemplates.ContentReportAcknowledgedBody
                .Replace("{caseNumber}", reportCase.CaseNumber)
                .Replace("{name}", StringLib.SafeString(name))
                .Replace("{contentName}", StringLib.SafeString(contentName))
                .Replace("{submissionDate}", reportCase.CreatedAt.ToString("dd/MM/yyyy hh:mm tt")),
            email: StringLib.SafeString(email),
            phone: StringLib.SafeString(phone)
        );

        return reportCase;
    }

    public async Task<Models.ReportContentCase> Resolve(ResolveContentReportInput input)
    {
        var reportCase = await GetCaseById(input.ReportContentCaseId);

        if (reportCase.Status != ReportContentCaseStatus.ACKNOWLEDGED)
        {
            string status = char.ToUpper(reportCase.Status[0]) + reportCase.Status.Substring(1).ToLower();
            throw new HttpRequestException($"ReportCaseIs{status}");
        }

        var resolutionDate = DateTime.Now;
        await _reportContentCaseCollection.UpdateOneAsync(
            x => x.Id == input.ReportContentCaseId,
            Builders<Models.ReportContentCase>.Update
                .Set(x => x.Status, ReportContentCaseStatus.RESOLVED)
                .Set(x => x.ResolvedAt, resolutionDate)
                .Set(x => x.ResolvedById, input.AdminId)
                .Set(x => x.ResolvedMessage, input.Message)
                .Set(x => x.UpdatedAt, resolutionDate)
        );

        // send notifications to user
        var name = reportCase.Name;
        var email = reportCase.Email;
        var phone = reportCase.Phone;

        if (reportCase.CreatedById is not null)
        {
            var user = await _userService.GetUserById(reportCase.CreatedById);
            if (user is not null)
            {
                name = user.Name;
                email = user.Email;
                phone = user.PhoneNumber;
            }
        }

        var contentName = await this.ResolveContentName(reportCase.ContentId, reportCase.ContentType);

        SendNotification(
            subject: EmailTemplates.ContentReportResolvedSubject
                .Replace("{caseNumber}", reportCase.CaseNumber),
            body: EmailTemplates.ContentReportResolvedBody
                .Replace("{caseNumber}", reportCase.CaseNumber)
                .Replace("{name}", StringLib.SafeString(name))
                .Replace("{contentName}", StringLib.SafeString(contentName))
                .Replace("{decision}", input.Message)
                .Replace("{resolutionDate}", resolutionDate.ToString("dd/MM/yyyy hh:mm tt")),
            email: StringLib.SafeString(email),
            phone: StringLib.SafeString(phone)
        );

        return reportCase;
    }

    public async Task<Models.ReportContentCase> GetCaseById(string id)
    {
        var data = await _reportContentCaseCollection.Find(x => x.Id == id).FirstOrDefaultAsync();
        if (data is null)
        {
            throw new HttpRequestException("ReportContentCaseNotFound");
        }

        return data;
    }

    private async Task<string> ResolveContentName(string contentId, string contentType)
    {
        if (contentType == ReportContentCaseType.COLLECTION)
        {
            var collection = _collectionService.GetCollection(contentId);
            if (collection is not null)
            {
                return collection.Name;
            }
        }
        else if (contentType == ReportContentCaseType.IMAGE)
        {
            var image = await _searchContentService.GetContentById(contentId);
            if (image is not null)
            {
                return image.Title;
            }
        }
        else if (contentType == ReportContentCaseType.TAG)
        {
            var tag = await _searchTagService.Get(contentId);
            if (tag is not null)
            {
                return tag.Name;
            }
        }

        return "Unknown";
    }

    private void SendNotification(string subject, string body, string phone, string email)
    {
        if (phone is not null)
        {
            var _ = SmsConfiguration.SendSms(new SendSmsInput
            {
                PhoneNumber = StringLib.NormalizePhoneNumber(phone),
                Message = body,
                AppId = _appConstantsConfiguration.SmsAppId,
                AppSecret = _appConstantsConfiguration.SmsAppSecret
            });
        }

        if (email is not null)
        {
            var _ = EmailConfiguration.Send(new SendEmailInput
            {
                From = _appConstantsConfiguration.EmailFrom,
                Email = email,
                Subject = subject,
                Message = body,
                ApiKey = _appConstantsConfiguration.ResendApiKey
            });
        }
    }

}