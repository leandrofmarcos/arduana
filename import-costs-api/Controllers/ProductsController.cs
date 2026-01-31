using Microsoft.AspNetCore.Mvc;

namespace import_costs_api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ProductsController : ControllerBase
{
    private static readonly List<Product> Products = new()
    {
        new Product { Id = 1, Name = "Produto 1", Price = 100.00m, Category = "Eletrônicos" },
        new Product { Id = 2, Name = "Produto 2", Price = 200.00m, Category = "Eletrodomésticos" },
        new Product { Id = 3, Name = "Produto 3", Price = 150.00m, Category = "Eletrônicos" }
    };

    private readonly ILogger<ProductsController> _logger;

    public ProductsController(ILogger<ProductsController> logger)
    {
        _logger = logger;
    }

    /// <summary>
    /// Retorna todos os produtos
    /// </summary>
    [HttpGet]
    public ActionResult<IEnumerable<Product>> GetAll()
    {
        _logger.LogInformation("Buscando todos os produtos");
        return Ok(Products);
    }

    /// <summary>
    /// Retorna um produto específico por ID
    /// </summary>
    [HttpGet("{id}")]
    public ActionResult<Product> GetById(int id)
    {
        var product = Products.FirstOrDefault(p => p.Id == id);
        if (product == null)
        {
            _logger.LogWarning("Produto {ProductId} não encontrado", id);
            return NotFound(new { message = $"Produto com ID {id} não encontrado" });
        }

        return Ok(product);
    }

    /// <summary>
    /// Cria um novo produto
    /// </summary>
    [HttpPost]
    public ActionResult<Product> Create([FromBody] CreateProductDto dto)
    {
        var newProduct = new Product
        {
            Id = Products.Max(p => p.Id) + 1,
            Name = dto.Name,
            Price = dto.Price,
            Category = dto.Category
        };

        Products.Add(newProduct);
        _logger.LogInformation("Produto {ProductId} criado com sucesso", newProduct.Id);

        return CreatedAtAction(nameof(GetById), new { id = newProduct.Id }, newProduct);
    }

    /// <summary>
    /// Atualiza um produto existente
    /// </summary>
    [HttpPut("{id}")]
    public ActionResult<Product> Update(int id, [FromBody] CreateProductDto dto)
    {
        var product = Products.FirstOrDefault(p => p.Id == id);
        if (product == null)
        {
            return NotFound(new { message = $"Produto com ID {id} não encontrado" });
        }

        product.Name = dto.Name;
        product.Price = dto.Price;
        product.Category = dto.Category;

        _logger.LogInformation("Produto {ProductId} atualizado com sucesso", id);

        return Ok(product);
    }

    /// <summary>
    /// Remove um produto
    /// </summary>
    [HttpDelete("{id}")]
    public ActionResult Delete(int id)
    {
        var product = Products.FirstOrDefault(p => p.Id == id);
        if (product == null)
        {
            return NotFound(new { message = $"Produto com ID {id} não encontrado" });
        }

        Products.Remove(product);
        _logger.LogInformation("Produto {ProductId} removido com sucesso", id);

        return NoContent();
    }
}

public class Product
{
    public int Id { get; set; }
    public required string Name { get; set; }
    public decimal Price { get; set; }
    public required string Category { get; set; }
}

public class CreateProductDto
{
    public required string Name { get; set; }
    public decimal Price { get; set; }
    public required string Category { get; set; }
}
