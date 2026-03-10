//> using scala "3.3.3"
//> using dep "io.javalin:javalin-bundle:6.4.0"
//> using dep "org.postgresql:postgresql:42.7.4"

import io.javalin.Javalin
import java.net.URLEncoder
import java.nio.charset.StandardCharsets
import java.sql.DriverManager
import java.util.ArrayList
import java.util.HashMap
import scala.util.Using

object VehicleModelService {
  private def requireEnv(name: String): String = {
    val value = Option(System.getenv(name)).map(_.trim).getOrElse("")
    if (value.isEmpty) {
      throw new IllegalStateException(s"Missing required environment variable: $name")
    }
    value
  }

  private def encode(value: String): String =
    URLEncoder.encode(value, StandardCharsets.UTF_8)

  private def buildConnectionStringFromEnv(): String = {
    val host = requireEnv("DB_HOST")
    val port = requireEnv("DB_PORT")
    val database = requireEnv("DB_NAME")
    val user = encode(requireEnv("DB_USER"))
    val password = encode(requireEnv("DB_PASSWORD"))

    s"jdbc:postgresql://$host:$port/$database?user=$user&password=$password"
  }

  private val dbConnectionString =
    Option(System.getenv("VEHICLE_MODEL_DB_CONNECTION")).filter(_.trim.nonEmpty).getOrElse(buildConnectionStringFromEnv())

  @main def runService(): Unit = {
    val host = Option(System.getenv("VEHICLE_MODEL_SERVICE_HOST")).filter(_.trim.nonEmpty).getOrElse("127.0.0.1")
    val port = Option(System.getenv("VEHICLE_MODEL_SERVICE_PORT")).flatMap(v => scala.util.Try(v.toInt).toOption).getOrElse(5056)

    val app = Javalin.create()

    app.get("/vehiclemodel") { ctx =>
      val normalizedQuery = Option(ctx.queryParam("query")).map(_.trim.toLowerCase).getOrElse("")

      if (normalizedQuery.isEmpty) {
        val response = new HashMap[String, AnyRef]()
        response.put("suggestions", new ArrayList[HashMap[String, String]]())
        ctx.json(response)
      } else {
        val sql = "SELECT DISTINCT name FROM vehiclemodel WHERE name ILIKE ? LIMIT 10"

        val suggestionsResult =
          Using.resource(DriverManager.getConnection(dbConnectionString)) { connection =>
            Using.resource(connection.prepareStatement(sql)) { statement =>
              statement.setString(1, s"$normalizedQuery%")

              Using.resource(statement.executeQuery()) { resultSet =>
                val rows = new ArrayList[HashMap[String, String]]()
                while (resultSet.next()) {
                  val row = new HashMap[String, String]()
                  row.put("name", resultSet.getString("name"))
                  rows.add(row)
                }
                rows
              }
            }
          }

        suggestionsResult match {
          case scala.util.Success(suggestions) =>
            val response = new HashMap[String, AnyRef]()
            response.put("suggestions", suggestions)
            ctx.json(response)
          case scala.util.Failure(ex) =>
            val errorResponse = new HashMap[String, String]()
            errorResponse.put("error", ex.getMessage)
            ctx.status(500).json(errorResponse)
        }
      }
    }

    app.start(host, port)
    println(s"VehicleModelService running on http://$host:$port")
  }
}
