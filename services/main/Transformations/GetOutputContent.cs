

using main.DTOs;
using main.Models;


public class GetOutputContent
{
    private OutputContent _content;
    public GetOutputContent(Content content){
        _content = new OutputContent{
            Id = content.Id,
            Type = content.Type,
            Status = content.Status,
            Visibility = content.Visibility,
            Amount = content.Amount,
            Media = content.Media.Location,
            Tags = content.Tags,
            DoneAt = content.DoneAt,
            RejectedAt = content.RejectedAt,
            CreatedAt = content.CreatedAt,
            UpdatedAt = content.UpdatedAt
        };
    }

    public OutputContent Result(){
        return _content;
    }
}