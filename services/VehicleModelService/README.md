# VehicleModelService (Scala)

Scala service consumed by Node `/utils/vehiclemodel` endpoint.

For full cradle-to-grave developer documentation, see:

- `services/VehicleModelService/DEVELOPER_REFERENCE.md`

## DB connection string from `.env`

This service builds a PostgreSQL JDBC connection string from these required environment variables:

- `DB_HOST`
- `DB_PORT`
- `DB_NAME`
- `DB_USER`
- `DB_PASSWORD`

Optional override:

- `VEHICLE_MODEL_DB_CONNECTION`

## Run

```bash
export VEHICLE_MODEL_SERVICE_HOST=127.0.0.1
export VEHICLE_MODEL_SERVICE_PORT=5056

scala-cli run services/VehicleModelService/VehicleModelService.scala
```

## Endpoint

- `GET /vehiclemodel?query=cor`
- Response: `{ "suggestions": [{ "name": "Corolla" }] }`
