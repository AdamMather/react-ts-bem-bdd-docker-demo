# VehicleMakeService

Small ASP.NET Core service used by Node `/utils/vehiclemake` endpoint.

For full cradle-to-grave developer documentation, see:

- `services/VehicleMakeService/DEVELOPER_REFERENCE.md`

## Run

```bash
dotnet restore
export VEHICLE_MAKE_DB_CONNECTION='Host=192.168.191.129;Port=5432;Database=devdb;Username=admin;Password=20Adm!n24'
dotnet run --project services/VehicleMakeService --urls http://127.0.0.1:5055
```

## Endpoint

- `GET /vehiclemake?query=for`
- Response: `{ "suggestions": [{ "name": "Ford" }] }`
