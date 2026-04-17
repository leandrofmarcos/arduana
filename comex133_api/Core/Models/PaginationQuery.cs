namespace Comex133Api.Core.Models;

public class PaginationQuery
{
    public const int DefaultPage = 1;
    public const int DefaultPageSize = 20;
    public const int MaxPageSize = 100;

    public int Page { get; set; } = DefaultPage;
    public int PageSize { get; set; } = DefaultPageSize;

    public int NormalizePage() => Page < 1 ? DefaultPage : Page;

    public int NormalizePageSize()
    {
        if (PageSize < 1)
            return DefaultPageSize;

        return PageSize > MaxPageSize ? MaxPageSize : PageSize;
    }
}
