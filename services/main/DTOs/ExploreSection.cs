
using System.ComponentModel.DataAnnotations;

namespace main.DTOs;

public class CreateExploreSectionInput
{
    /// <summary>
    /// Type of the section
    /// </summary>
    /// <example>TAG | CONTENT | COLLECTION | CREATOR</example>
    [Required]
    public required string Type { get; set; }

    /// <summary>
    /// Endpoint that should be called to fetch data
    /// </summary>
    /// <example>/collections/:collection_slug</example>
    [Required]
    public required string Endpoint { get; set; }

    /// <summary>
    /// Title of the section
    /// </summary>
    /// <example>Hello world</example>
    [Required]
    public required string Title { get; set; }

    /// <summary>
    /// Pathname to see more of that section. If null, then there's no registered page for it.
    /// </summary>
    /// <example>/explore/collections</example>
    public string? SeeMorePathname { get; set; }

    /// <summary>
    /// When this is true, user must be authenticated to see this section
    /// </summary>
    /// <example>false</example>
    public bool? EnsureAuth { get; set; }

    /// <summary>
    /// When this is PUBLIC, everyone can see this section on the website .
    /// </summary>
    /// <example>PUBLIC | PRIVATE</example>
    public string? Visibility { get; set; }
}