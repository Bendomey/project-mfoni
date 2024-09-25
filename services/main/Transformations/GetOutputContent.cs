using main.DTOs;
using main.Models;
namespace main.Transformations;


public class GetOutputContent
{
    private OutputContent _content;
    public GetOutputContent(Content content)
    {
        List<OutputTag> tags = [];

        if (content.Tags != null)
        {
            tags = content.Tags.Select(tag =>
            {
                var outputTag = new GetOutputTag(tag);
                return outputTag.Result();
            }).ToList();
        }

        OutputUser? user = null;
        if (content.CreatedBy != null)
        {
            var outputUser = new GetOutputUser(content.CreatedBy);
            user = outputUser.Result();
        }

        _content = new OutputContent
        {
            Id = content.Id,
            Type = content.Type,
            Status = content.Status,
            Visibility = content.Visibility,
            Amount = content.Amount,
            Media = content.Media.Location,
            Tags = tags,
            DoneAt = content.DoneAt,
            RejectedAt = content.RejectedAt,
            CreatedById = content.CreatedById,
            CreatedBy = user,
            CreatedAt = content.CreatedAt,
            UpdatedAt = content.UpdatedAt
        };
    }

    public OutputContent Result()
    {
        return _content;
    }
}