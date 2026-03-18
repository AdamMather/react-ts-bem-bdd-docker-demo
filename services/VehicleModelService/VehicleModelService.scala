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
  private val SqlIdentifierPattern = "^[A-Za-z_][A-Za-z0-9_]*$".r

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

  private def requireSqlIdentifier(value: String, description: String): String =
    SqlIdentifierPattern.findFirstIn(value).getOrElse {
      throw new IllegalArgumentException(s"Invalid SQL identifier for $description: $value")
    }

  private def buildSuggestionSql(selectColumnName: String, tableName: String, whereColumnName: String): String = {
    val validatedSelectColumnName = requireSqlIdentifier(selectColumnName, "select column")
    val validatedTableName = requireSqlIdentifier(tableName, "table")
    val validatedWhereColumnName = requireSqlIdentifier(whereColumnName, "where column")

    s"SELECT DISTINCT $validatedSelectColumnName FROM $validatedTableName WHERE $validatedWhereColumnName ILIKE ? LIMIT 10"
  }

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
        val suggestionColumnName = "name"
        val tableName = "vehiclemodel"
        val whereColumnName = "name"
        val sql = buildSuggestionSql(suggestionColumnName, tableName, whereColumnName)

        val suggestionsResult =
          Using.resource(DriverManager.getConnection(dbConnectionString)) { connection =>
            Using.resource(connection.prepareStatement(sql)) { statement =>
              statement.setString(1, s"$normalizedQuery%")

              Using.resource(statement.executeQuery()) { resultSet =>
                val rows = new ArrayList[HashMap[String, String]]()
                while (resultSet.next()) {
                  val row = new HashMap[String, String]()
                  row.put(suggestionColumnName, resultSet.getString(suggestionColumnName))
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
