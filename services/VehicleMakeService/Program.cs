using Npgsql;
using System.Text.RegularExpressions;

var builder = WebApplication.CreateBuilder(args);

var connectionString = builder.Configuration.GetConnectionString("Default")
  ?? Environment.GetEnvironmentVariable("VEHICLE_MAKE_DB_CONNECTION")
  ?? throw new InvalidOperationException("No DB connection configured. Set ConnectionStrings:Default or VEHICLE_MAKE_DB_CONNECTION.");

var app = builder.Build();

string RequireSqlIdentifier(string value, string description)
{
  if (Regex.IsMatch(value, "^[A-Za-z_][A-Za-z0-9_]*$"))
  {
    return value;
  }

  throw new ArgumentException($"Invalid SQL identifier for {description}: {value}", nameof(value));
}

string BuildSuggestionSql(string selectColumnName, string tableName, string whereColumnName)
{
  var validatedSelectColumnName = RequireSqlIdentifier(selectColumnName, "select column");
  var validatedTableName = RequireSqlIdentifier(tableName, "table");
  var validatedWhereColumnName = RequireSqlIdentifier(whereColumnName, "where column");

  return $"SELECT DISTINCT {validatedSelectColumnName} FROM {validatedTableName} WHERE {validatedWhereColumnName} ILIKE @prefix LIMIT 10";
}

app.MapGet("/vehiclemake", async (string? query) =>
{
  var normalizedQuery = (query ?? string.Empty).Trim().ToLowerInvariant();
  if (string.IsNullOrEmpty(normalizedQuery))
  {
    return Results.Ok(new { suggestions = Array.Empty<object>() });
  }

  await using var connection = new NpgsqlConnection(connectionString);
  await connection.OpenAsync();

  const string suggestionColumnName = "name";
  const string tableName = "vehiclemake";
  const string whereColumnName = "name";
  var sql = BuildSuggestionSql(suggestionColumnName, tableName, whereColumnName);
  await using var command = new NpgsqlCommand(sql, connection);
  command.Parameters.AddWithValue("prefix", $"{normalizedQuery}%");

  await using var reader = await command.ExecuteReaderAsync();

  var suggestions = new List<object>();
  while (await reader.ReadAsync())
  {
    suggestions.Add(new Dictionary<string, string>
    {
      [suggestionColumnName] = reader.GetString(reader.GetOrdinal(suggestionColumnName))
    });
  }

  return Results.Ok(new { suggestions });
});

app.Run();
