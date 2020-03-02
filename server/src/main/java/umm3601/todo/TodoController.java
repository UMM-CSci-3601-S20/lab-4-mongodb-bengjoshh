package umm3601.todo;

import static com.mongodb.client.model.Filters.and;
import static com.mongodb.client.model.Filters.eq;
import static com.mongodb.client.model.Filters.regex;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

import com.google.common.collect.ImmutableMap;
import com.mongodb.client.MongoCollection;
import com.mongodb.client.MongoDatabase;
import com.mongodb.client.model.Sorts;

import org.bson.Document;
import org.bson.conversions.Bson;
import org.bson.types.ObjectId;
import org.mongojack.JacksonCodecRegistry;

import io.javalin.http.BadRequestResponse;
import io.javalin.http.Context;
import io.javalin.http.NotFoundResponse;

public class TodoController {

  JacksonCodecRegistry jacksonCodecRegistry = JacksonCodecRegistry.withDefaultObjectMapper();

  private final MongoCollection<Todo> todoCollection;

  /**
   * Construct a controller for todos.
   *
   * @param database the database containing todo data
   */
  public TodoController(MongoDatabase database) {
    jacksonCodecRegistry.addCodecForClass(Todo.class);
    todoCollection = database.getCollection("todos").withDocumentClass(Todo.class)
        .withCodecRegistry(jacksonCodecRegistry);
  }

  public void getTodo(Context ctx) {
    String id = ctx.pathParam("id");

    Todo todo;

    try {
      todo = todoCollection.find(eq("_id", new ObjectId(id))).first();
   } catch (IllegalArgumentException e) {
     throw new BadRequestResponse("The requested todo id wasn't a legal Mongo Object ID.");
   }
   if (todo == null) {
     throw new NotFoundResponse("The requested todo could not be found.");
   } else {
     ctx.json(todo);
   }

  }

  public void getTodos(Context ctx) {
    List<Bson> filters = new ArrayList<Bson>(); // start with a blank document

    if(ctx.queryParamMap().containsKey("status")){
      boolean targetStatus = ctx.queryParam("status").equals("complete");
      filters.add(eq("status", targetStatus));
    }
    ctx.json(todoCollection.find(filters.isEmpty() ? new Document() : and(filters))
    .into(new ArrayList<>()));
  }

  public void addTodo(Context ctx) {

  }

  public void deleteTodo(Context ctx) {

  }
}
