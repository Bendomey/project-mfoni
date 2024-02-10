

using main.DTOs;
using main.Models;


public class GetOutputTag
{
    private OutputTag _tag;
    public GetOutputTag(Tag tag)
    {
        _tag = new OutputTag
        {
            Id = tag.Id,
            Name = tag.Name,
            Description = tag.Name,
            CreatedAt = tag.CreatedAt,
            UpdatedAt = tag.UpdatedAt
        };
    }

    public OutputTag Result()
    {
        return _tag;
    }
}