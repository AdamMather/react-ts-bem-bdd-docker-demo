# VehicleMakeService Developer Reference (Cradle To Grave)

## 1. Purpose And Scope

`VehicleMakeService` is a focused ASP.NET Core minimal API that provides vehicle make suggestions for typeahead/autocomplete.

It exists to:

1. decouple make lookup from the Node API process
2. keep autocomplete contract stable (`{ suggestions: [{ name: string }] }`)
3. share the same PostgreSQL data source as the rest of the stack

The service currently exposes one endpoint:

- `GET /vehiclemake?query=<prefix>`

## 2. Where It Fits In The System

Flow from browser to database:

1. Frontend calls Node endpoint `GET /utils/vehiclemake?query=...`
2. Node (`src/server/index.js`) forwards request to `VehicleMakeService` at `VEHICLE_MAKE_SERVICE_URL`
3. `VehicleMakeService` queries PostgreSQL table `vehiclemake`
4. Response returns back through Node to frontend

This means the integration boundary is not direct frontend-to-C#; Node is the proxy/adapter layer.

## 3. Code Inventory

Service files:

- `services/VehicleMakeService/Program.cs`
- `services/VehicleMakeService/VehicleMakeService.csproj`
- `services/VehicleMakeService/README.md`

Solution wiring:

- `vac-test.sln` includes `VehicleMakeService` only (under `services`)

## 4. Tech Stack And Build Inputs

- .NET: `net8.0`
- Project SDK: `Microsoft.NET.Sdk.Web`
- DB client: `Npgsql` `8.0.3`
- Hosting model: ASP.NET Core minimal API (`WebApplication`)

No controllers, no EF Core, no DI service registrations yet; this is intentionally lean.

## 5. Environment Contract

Database connection resolution in `Program.cs`:

1. `ConnectionStrings:Default` from ASP.NET configuration providers
2. fallback to `VEHICLE_MAKE_DB_CONNECTION` environment variable
3. throw startup error if neither exists

Expected connection string format (Npgsql):

```text
Host=<host>;Port=<port>;Database=<db>;Username=<user>;Password=<password>
```

Runtime binding:

- host/port are set via `dotnet run --urls ...` in current workflow

Node integration setting:

- `VEHICLE_MAKE_SERVICE_URL` should point to this service base URL (default in Node is `http://127.0.0.1:5055`)

## 6. Startup Lifecycle (What Happens At Process Boot)

`Program.cs` boot sequence:

1. `WebApplication.CreateBuilder(args)` builds host/configuration pipeline
2. connection string is resolved immediately (fail-fast if missing)
3. `builder.Build()` creates app instance
4. route mapping for `/vehiclemake` is registered
5. `app.Run()` starts Kestrel and blocks

Operational implication:

- misconfigured DB credentials fail at first request (connection open), but missing configuration fails at startup

## 7. Request Lifecycle (Endpoint Deep Dive)

Endpoint signature:

```csharp
app.MapGet("/vehiclemake", async (string? query) => { ... });
```

Behavior:

1. `query` is normalized (`trim + lowercase`)
2. if empty, returns `200` with `{"suggestions":[]}` (no DB call)
3. opens PostgreSQL connection with `NpgsqlConnection`
4. executes parameterized SQL:
   `SELECT DISTINCT name FROM vehiclemake WHERE name ILIKE @prefix LIMIT 10`
5. binds `@prefix` as `<query>%`
6. materializes rows into array of `{ name: <string> }`
7. returns `200` with `{"suggestions":[...]}` 

Important properties:

- case-insensitive matching via `ILIKE`
- prefix-only search (not contains)
- result cap of 10
- duplicate names collapsed with `DISTINCT`
- SQL injection risk is mitigated by parameterized command usage

## 8. Response Contract

Success:

```json
{
  "suggestions": [
    { "name": "Ford" },
    { "name": "Fiat" }
  ]
}
```

Empty query or no matches:

```json
{
  "suggestions": []
}
```

Current error handling:

- unhandled exceptions use ASP.NET Core default behavior (5xx response)
- no custom error schema is defined yet

## 9. Local Development: Cradle To Grave Runbook

## 9.1 Prerequisites

1. .NET SDK 8.x
2. network access to PostgreSQL used by project data
3. valid make table data in `vehiclemake(name)`

## 9.2 Restore And Build

From repo root:

```bash
dotnet restore services/VehicleMakeService/VehicleMakeService.csproj
dotnet build services/VehicleMakeService/VehicleMakeService.csproj
```

## 9.3 Run The Service

```bash
export VEHICLE_MAKE_DB_CONNECTION='Host=<host>;Port=5432;Database=<db>;Username=<user>;Password=<password>'
dotnet run --project services/VehicleMakeService --urls http://127.0.0.1:5055
```

## 9.4 Smoke Test The Endpoint

```bash
curl "http://127.0.0.1:5055/vehiclemake?query=for"
```

Expected shape:

```json
{"suggestions":[{"name":"Ford"}]}
```

## 9.5 Verify Node Integration

1. ensure Node server has `VEHICLE_MAKE_SERVICE_URL=http://127.0.0.1:5055`
2. run Node API (`node src/server/index.js`)
3. call:

```bash
curl "http://127.0.0.1:3001/utils/vehiclemake?query=for"
```

If C# service is down, Node returns `502` with:

```json
{"error":"Vehicle make service unavailable"}
```

## 10. Data Dependencies

SQL used by service assumes:

1. table `vehiclemake` exists
2. column `name` exists and is text-like
3. data quality supports distinct name values

Recommended DB index for larger datasets:

- B-Tree or trigram strategy for prefix `ILIKE` search depending on query volume and collation requirements

## 11. Observability And Operations

Current state:

- default ASP.NET logging only
- no structured correlation IDs
- no health endpoint

Recommended additions:

1. `GET /healthz` for liveness/readiness
2. explicit exception-to-JSON mapping for API consumers
3. request timing metrics around DB query
4. optional response caching for repeated prefixes

## 12. Security Notes

1. Do not commit live connection strings or credentials.
2. Prefer environment variables or secret stores per environment.
3. Service currently has no authn/authz; only expose on trusted network segments.
4. Keep parameterized SQL pattern for all future queries.

## 13. Common Failure Modes And Fixes

1. Startup crash with "No DB connection configured"
- set `ConnectionStrings:Default` or `VEHICLE_MAKE_DB_CONNECTION`

2. Runtime 500 on query
- validate DB host reachability and credentials
- verify table/column existence: `vehiclemake.name`

3. Node returns 502 from `/utils/vehiclemake`
- confirm C# service is running at `VEHICLE_MAKE_SERVICE_URL`
- confirm port/host alignment (`--urls` vs env var)

4. Empty suggestions despite expected data
- verify query is prefix-based (`"fo"` matches `"Ford"`, but `"ord"` does not)
- check database collation/data normalization

## 14. Extension Guide

When extending endpoint behavior, keep contract compatibility for Node/frontend:

1. preserve top-level `suggestions` array
2. add fields as non-breaking optional properties
3. version path only if shape must change (for example `/v2/vehiclemake`)

Suggested incremental improvements:

1. extract SQL/data access into dedicated class for testability
2. add integration tests with ephemeral PostgreSQL container
3. add cancellation token support from request pipeline
4. add request validation constraints (minimum query length)

## 15. Delivery Checklist

Before merging service changes:

1. `dotnet build` passes
2. local curl against service succeeds
3. local curl through Node `/utils/vehiclemake` succeeds
4. no credential leaks in code/docs
5. API response shape remains backward compatible

## 16. Reference Links In Repo

- C# service entrypoint: `services/VehicleMakeService/Program.cs`
- C# project file: `services/VehicleMakeService/VehicleMakeService.csproj`
- Node integration route: `src/server/index.js` (`/utils/vehiclemake`)
- Node DB config (for broader stack context): `src/server/config.js`
- Solution file: `vac-test.sln`
