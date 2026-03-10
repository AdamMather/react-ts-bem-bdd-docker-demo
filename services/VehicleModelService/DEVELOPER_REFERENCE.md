# VehicleModelService Developer Reference (Cradle To Grave)

## 1. Purpose And Scope

`VehicleModelService` is a focused Scala API for vehicle model autocomplete suggestions.

It exists to:

1. move model lookup out of the Node process
2. keep the autocomplete response contract stable (`{ suggestions: [{ name: string }] }`)
3. query PostgreSQL directly for model data

Current endpoint:

- `GET /vehiclemodel?query=<prefix>`

## 2. Where It Fits In The System

Request flow:

1. frontend requests `GET /utils/vehiclemodel?query=...` (via app config URL)
2. Node API (`src/server/index.js`) proxies that call to `VehicleModelService` at `VEHICLE_MODEL_SERVICE_URL`
3. Scala service queries PostgreSQL table `vehiclemodel`
4. JSON response returns through Node to the frontend

Important runtime note:

- the default frontend path in this repo currently uses `mockApi` (`src/services/mockApi.ts`), so this Scala service is part of the optional real-backend path, not the default dev UI path

## 3. Code Inventory

Service files:

- `services/VehicleModelService/VehicleModelService.scala`
- `services/VehicleModelService/README.md`
- `services/VehicleModelService/DEVELOPER_REFERENCE.md`

Repository integration files:

- `src/server/index.js` (Node proxy endpoint `/utils/vehiclemodel`)
- `.env` (`VEHICLE_MODEL_SERVICE_URL` and DB vars)
- `src/config/index.ts` (frontend config includes `/utils/vehiclemodel`)

Solution/build note:

- `vac-test.sln` currently includes only `VehicleMakeService` (.NET); Scala service is not part of that solution

## 4. Tech Stack And Build Inputs

- Scala: `3.3.3` (declared in source directives)
- HTTP server: `io.javalin:javalin-bundle:6.4.0`
- DB driver: `org.postgresql:postgresql:42.7.4`
- Packaging model: single Scala CLI script with `//> using ...` directives

`VehicleModelService.scala` is self-contained and does not currently use an `sbt` project layout.

## 5. Environment Contract

Connection string resolution in code:

1. if `VEHICLE_MODEL_DB_CONNECTION` is set and non-empty, use it directly
2. otherwise build JDBC URL from required variables:
   - `DB_HOST`
   - `DB_PORT`
   - `DB_NAME`
   - `DB_USER`
   - `DB_PASSWORD`

If any required DB variable is missing while building from components, startup fails with:

- `Missing required environment variable: <NAME>`

Service binding variables:

- `VEHICLE_MODEL_SERVICE_HOST` (default `127.0.0.1`)
- `VEHICLE_MODEL_SERVICE_PORT` (default `5056`)

Node proxy integration variable:

- `VEHICLE_MODEL_SERVICE_URL` (Node default `http://127.0.0.1:5056`)

## 6. Startup Lifecycle

Boot sequence inside `runService()`:

1. resolve host/port from environment (with defaults)
2. build Javalin app instance
3. register `GET /vehiclemodel`
4. start server on host/port
5. print startup log line with resolved URL

Failure behavior:

- missing required DB env variables for derived connection string: fail at process startup (during initialization)
- invalid DB credentials/network: startup succeeds, failures surface when query endpoint is used

## 7. Request Lifecycle (Endpoint Deep Dive)

Route:

- `GET /vehiclemodel?query=<value>`

Behavior:

1. normalize query: trim + lowercase
2. if query empty: return `200` with `{ "suggestions": [] }`
3. if query present:
   - open JDBC connection
   - execute parameterized SQL:
     - `SELECT DISTINCT name FROM vehiclemodel WHERE name ILIKE ? LIMIT 10`
   - bind parameter to `<query>%` (prefix match)
   - map rows to `{ name: "<model>" }`
4. return `200` with `{ "suggestions": [...] }`
5. on error: return `500` with `{ "error": "<message>" }`

Implementation details:

- DB resource handling uses `scala.util.Using`
- query remains parameterized (SQL injection resistance)
- result size is capped at 10

## 8. API Contract

Success:

```json
{
  "suggestions": [
    { "name": "Corolla" },
    { "name": "Corsa" }
  ]
}
```

Empty query/no matches:

```json
{
  "suggestions": []
}
```

Error:

```json
{
  "error": "..."
}
```

## 9. Local Development Runbook (Cradle To Grave)

## 9.1 Prerequisites

1. Java runtime (for Scala CLI execution)
2. `scala-cli` installed and available on `PATH`
3. PostgreSQL reachable with table `vehiclemodel(name)`
4. `.env` values aligned with local services

## 9.2 Set Environment

Example component-based configuration:

```bash
export DB_HOST=127.0.0.1
export DB_PORT=5432
export DB_NAME=devdb
export DB_USER=admin
export DB_PASSWORD='<password>'
export VEHICLE_MODEL_SERVICE_HOST=127.0.0.1
export VEHICLE_MODEL_SERVICE_PORT=5056
```

Optional direct JDBC override:

```bash
export VEHICLE_MODEL_DB_CONNECTION='jdbc:postgresql://127.0.0.1:5432/devdb?user=admin&password=<password>'
```

## 9.3 Run Service

From repo root:

```bash
scala-cli run services/VehicleModelService/VehicleModelService.scala
```

Expected startup log:

```text
VehicleModelService running on http://127.0.0.1:5056
```

## 9.4 Smoke Test Service Directly

```bash
curl "http://127.0.0.1:5056/vehiclemodel?query=cor"
```

Expected shape:

```json
{"suggestions":[{"name":"Corolla"}]}
```

## 9.5 Verify Node Proxy Integration

1. set Node env `VEHICLE_MODEL_SERVICE_URL=http://127.0.0.1:5056`
2. run Node API:

```bash
node src/server/index.js
```

3. call Node endpoint:

```bash
curl "http://127.0.0.1:3001/utils/vehiclemodel?query=cor"
```

If Scala service is unavailable, Node returns:

```json
{"error":"Vehicle model service unavailable"}
```

## 9.6 Optional Full Stack Integration Check

1. run Scala model service on `5056`
2. run make service on `5055` if testing both autocomplete paths
3. run Node API on `3001`
4. switch frontend data path from `mockApi` to HTTP client calls before expecting browser traffic to hit Node/Scala services

Without step 4, UI autocomplete data is served by in-memory `mockApi`.

## 10. Data Dependencies

The query assumes:

1. table `vehiclemodel` exists
2. column `name` exists
3. values are suitable for prefix `ILIKE` matching

For larger datasets, evaluate indexing strategy for `ILIKE` prefix search.

## 11. Observability And Operations

Current state:

- startup log line to stdout
- no explicit health endpoint
- no structured logging/correlation IDs

Recommended additions:

1. `GET /healthz` for liveness/readiness
2. request timing and DB latency logs
3. normalized error payloads with stable error codes
4. optional lightweight metrics export

## 12. Security Notes

1. never commit live credentials
2. prefer secret management over plaintext env files in shared environments
3. keep SQL parameterized for all new queries
4. service has no auth/authz today, so expose only on trusted internal networks

## 13. Common Failure Modes And Fixes

1. `Missing required environment variable: ...`
- set required DB component env vars or set `VEHICLE_MODEL_DB_CONNECTION`

2. Node returns `502` from `/utils/vehiclemodel`
- verify Scala service is running at `VEHICLE_MODEL_SERVICE_URL`
- verify host/port match actual Scala bind settings

3. Scala endpoint returns `500` with DB error
- validate credentials, host reachability, and schema (`vehiclemodel.name`)

4. Empty suggestions despite expected results
- query is prefix-based (`cor` matches `Corolla`, `roll` does not)
- verify source data normalization/casing expectations

## 14. Development Workflow Guidance

When changing service behavior:

1. update Scala endpoint code and keep response contract stable
2. smoke test direct endpoint (`curl`)
3. smoke test Node proxy endpoint (`/utils/vehiclemodel`)
4. update docs (`README.md` and this file) for contract/env changes

Contract compatibility rule:

- preserve top-level `suggestions` array unless introducing a versioned endpoint

## 15. Delivery Checklist

Before merge:

1. service starts with expected env configuration
2. direct endpoint smoke test passes
3. Node proxy smoke test passes
4. docs updated for any env/contract changes
