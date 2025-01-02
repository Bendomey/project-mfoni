

namespace main.DTOs;

public class OutputContent
{
    public string Id { get; set; } = null!;
    public required bool IsFeatured { get; set; }
    public required string Title { get; set; }
    public required string Slug { get; set; }
    public string Type { get; set; } = "IMAGE";
    public required string Visibility { get; set; }
    public string Status { get; set; } = null!;
    public DateTime? RejectedAt { get; set; } = null!;
    public DateTime? DoneAt { get; set; } = null!;
    public required List<string> TagsId { get; set; }
    public List<OutputTag>? Tags { get; set; }
    public required OutputContentMedia Media { get; set; }
    public required OutputContentMeta Meta { get; set; }
    public Int64 Amount { get; set; } = 0;
    public OutputContentLike? CurrentUserLike { get; set; }
    public required string CreatedById { get; set; }
    public OutputBasicCreator? CreatedBy { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
    public required ImageProcessingOutput ImageProcessingResponse { get; set; }
}

public class OutputContentMedia
{
    public required string Url { get; set; }
    public required string Orientation { get; set; }
    public required OutputContentMediaSizes Sizes { get; set; }
}

public class OutputContentMediaSizes
{
    public required Int64 Small { get; set; }
    public required Int64 Medium { get; set; }
    public required Int64 Large { get; set; }
    public required Int64 Original { get; set; }
}

public class OutputContentMeta
{
    public Int64 Views { get; set; } = 0;
    public Int64 Downloads { get; set; } = 0;
    public Int64 Likes { get; set; } = 0;
}

public class ImageProcessingOutput
{
    public string Status { get; set; } = "PENDING";
    public string? Message { get; set; }
}