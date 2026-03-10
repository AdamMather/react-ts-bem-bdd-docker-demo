using Npgsql;

var builder = WebApplication.CreateBuilder(args);

var connectionString = builder.Configuration.GetConnectionString("Default")
  ?? Environment.GetEnvironmentVariable("VEHICLE_MAKE_DB_CONNECTION")
  ?? throw new InvalidOperationException("No DB connection configured. Set ConnectionStrings:Default or VEHICLE_MAKE_DB_CONNECTION.");

var app = builder.Build();

app.MapGet("/vehiclemake", async (string? query) =>
{
  var normalizedQuery = (query ?? string.Empty).Trim().ToLowerInvariant();
  if (string.IsNullOrEmpty(normalizedQuery))
  {
    return Results.Ok(new { suggestions = Array.Empty<object>() });
  }

  await using var connection = new NpgsqlConnection(connectionString);
  await connection.OpenAsync();

  const string sql = "SELECT DISTINCT name FROM vehiclemake WHERE name ILIKE @prefix LIMIT 10";
  await using var command = new NpgsqlCommand(sql, connection);
  command.Parameters.AddWithValue("prefix", $"{normalizedQuery}%");

  await using var reader = await command.ExecuteReaderAsync();

  var suggestions = new List<object>();
  while (await reader.ReadAsync())
  {
    suggestions.Add(new { name = reader.GetString(0) });
  }

  return Results.Ok(new { suggestions });
});

app.Run();
