package umm3601.todo;

import static com.mongodb.client.model.Filters.eq;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;

import java.io.IOException;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.Map;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.google.common.collect.ImmutableMap;
import com.mockrunner.mock.web.MockHttpServletRequest;
import com.mockrunner.mock.web.MockHttpServletResponse;
import com.mongodb.BasicDBObject;
import com.mongodb.MongoClientSettings;
import com.mongodb.ServerAddress;
import com.mongodb.client.MongoClient;
import com.mongodb.client.MongoClients;
import com.mongodb.client.MongoCollection;
import com.mongodb.client.MongoDatabase;

import org.bson.Document;
import org.bson.types.ObjectId;
import org.junit.jupiter.api.AfterAll;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import io.javalin.http.BadRequestResponse;
import io.javalin.http.Context;
import io.javalin.http.NotFoundResponse;
import io.javalin.http.util.ContextUtil;
import io.javalin.plugin.json.JavalinJson;



/**
* Tests the logic of the TodoController
*
* @throws IOException
*/
public class TodoControllerSpec {

  MockHttpServletRequest mockReq = new MockHttpServletRequest();
  MockHttpServletResponse mockRes = new MockHttpServletResponse();

  private TodoController todoController;

  private ObjectId bensId;
  private BasicDBObject ben;

  static MongoClient mongoClient;
  static MongoDatabase db;

  static ObjectMapper jsonMapper = new ObjectMapper();

  @BeforeAll
  public static void setupAll() {
    String mongoAddr = System.getenv().getOrDefault("MONGO_ADDR", "localhost");

    mongoClient = MongoClients.create(
    MongoClientSettings.builder()
    .applyToClusterSettings(builder ->
    builder.hosts(Arrays.asList(new ServerAddress(mongoAddr))))
    .build());

    db = mongoClient.getDatabase("test");
  }

  @BeforeEach
  public void setupEach() throws IOException {

    // Reset our mock request and response objects
    mockReq.resetAll();
    mockRes.resetAll();

    // Setup database
    MongoCollection<Document> todoDocuments = db.getCollection("todos");
    todoDocuments.drop();
    List<Document> testTodos = new ArrayList<>();
    testTodos.add(Document.parse("{\n" +
    "                           owner: \"Fred\",\n" +
    "                           status: false,\n" +
    "                           body: \"This is Fred's cool todo\",\n" +
    "                           category: \"homework\"\n}"));
    testTodos.add(Document.parse("{\n" +
    "                           owner: \"Todd\",\n" +
    "                           status: false,\n" +
    "                           body: \"This is Todd's weird todo\",\n" +
    "                           category: \"video games\"\n}"));
    testTodos.add(Document.parse("{\n" +
    "                           owner: \"Rachel\",\n" +
    "                           status: true,\n" +
    "                           body: \"This is Rachel's cool todo\",\n" +
    "                           category: \"software design\"\n}"));
    testTodos.add(Document.parse("{\n" +
    "                           owner: \"Sara\",\n" +
    "                           status: false,\n" +
    "                           body: \"This is Sara's funky todo\",\n" +
    "                           category: \"homework\"\n}"));
    bensId = new ObjectId();
    ben = new BasicDBObject("_id", bensId);
    ben = ben.append("owner", "Ben")
    .append("status", true)
    .append("body", "Needs todo database features")
    .append("category", "software design");

    todoDocuments.insertMany(testTodos);
    todoDocuments.insertOne(Document.parse(ben.toJson()));

    todoController = new TodoController(db);

  }

  @AfterAll
  public static void teardown() {
    db.drop();
    mongoClient.close();
  }

  @Test
  public void GetTodoById() throws IOException{
    Context ctx = ContextUtil.init(mockReq, mockRes, "api/todos/:id", ImmutableMap.of("id", bensId.toHexString()));
    todoController.getTodo(ctx);

    assertEquals(200, mockRes.getStatus());

    String result = ctx.resultString();
    Todo resultTodo = JavalinJson.fromJson(result, Todo.class);
    //BasicDBObject resultDBObj = JavalinJson.fromJson(result, BasicDBObject.class);
    //assertEquals(resultDBObj, ben);
    //this really should work, but it doesn't, because the returned DB object
    //has a mapping of id to {oid: ""} rather than to the ID directly, and
    //converting the mapping is weirdly obnoxious.  So for now, we're just
    //checking the value of individual fields.

    assertEquals(resultTodo._id, bensId.toHexString());
    assertEquals(resultTodo.owner, "Ben");
    assertTrue(resultTodo.status);
  }

  @Test
  public void GetTodoByInvalidID() throws IOException {
    Context ctx = ContextUtil.init(mockReq, mockRes, "api/todos/:id", ImmutableMap.of("id", "badID"));

    assertThrows(BadRequestResponse.class, () -> {
      todoController.getTodo(ctx);
    } );

  }

  @Test
  public void GetTodoByNonexistentID() throws IOException {

    Context ctx = ContextUtil.init(mockReq, mockRes, "api/todos/:id", ImmutableMap.of("id", "ffffffffffffffffffffffff"));

    assertThrows(NotFoundResponse.class, () -> {
      todoController.getTodo(ctx);
    } );

  }

  @Test
  public void GetAllTodos() throws IOException {

    Context ctx = ContextUtil.init(mockReq, mockRes, "api/todos");

    todoController.getTodos(ctx);

    assertEquals(200, mockRes.getStatus());

    String result = ctx.resultString();
    MongoCollection<Document> todosCollection = db.getCollection("todos");
    //assertEquals(todosCollection, JavalinJson.fromJson(result, Class<MongoCollection<Document>>);
    assertEquals(todosCollection.countDocuments(), JavalinJson.fromJson(result, Todo[].class).length);

  }

  @Test
  public void GetTodoWithExistentID() throws IOException{
    String testID = bensId.toHexString();

    Context ctx = ContextUtil.init(mockReq, mockRes, "api/todos/:id", ImmutableMap.of("id", testID));
    todoController.getTodo(ctx);

    assertEquals(200, mockRes.getStatus());

    String result = ctx.resultString();
    Todo resultTodo = JavalinJson.fromJson(result, Todo.class);

    assertEquals(resultTodo._id, bensId.toHexString());
    assertEquals(resultTodo.owner, "Ben");

  }

  @Test
  public void GetTodosByStatus() throws IOException {

    mockReq.setQueryString("status=incomplete");
    Context ctx = ContextUtil.init(mockReq, mockRes, "api/todos");

    todoController.getTodos(ctx);
    assertEquals(200, mockRes.getStatus());

    String result = ctx.resultString();
    Todo[] resultArray = JavalinJson.fromJson(result, Todo[].class);
    assertEquals(3, resultArray.length);
    for (Todo todo: resultArray) {
      assertTrue(!todo.status);
    }
  }

  @Test
  public void GetTodosByBadStatus() throws IOException {
    mockReq.setQueryString("status=foo");
    Context ctx = ContextUtil.init(mockReq, mockRes, "api/todos");

    assertThrows(BadRequestResponse.class, () -> {
      todoController.getTodos(ctx);
    });
  }

  @Test
  public void GetTodosByOwner() throws IOException {

    mockReq.setQueryString("owner=Todd");
    Context ctx = ContextUtil.init(mockReq, mockRes, "api/todos");

    todoController.getTodos(ctx);
    assertEquals(200, mockRes.getStatus());

    String result = ctx.resultString();
    Todo[] resultArray = JavalinJson.fromJson(result, Todo[].class);
    assertEquals(1, resultArray.length);
    assertEquals("Todd", resultArray[0].owner);
  }

  @Test
  public void GetTodosByBody() throws IOException {

    mockReq.setQueryString("body=cool");
    Context ctx = ContextUtil.init(mockReq, mockRes, "api/todos");

    todoController.getTodos(ctx);
    assertEquals(200, mockRes.getStatus());

    String result = ctx.resultString();
    Todo[] resultArray = JavalinJson.fromJson(result, Todo[].class);
    assertEquals(2, resultArray.length);
    for(Todo todo: resultArray){
      assertTrue(todo.body.contains("cool"));
    }
  }

  @Test
  public void GetTodosByCategory() throws IOException {

    mockReq.setQueryString("category=homework");
    Context ctx = ContextUtil.init(mockReq, mockRes, "api/todos");

    todoController.getTodos(ctx);
    assertEquals(200, mockRes.getStatus());

    String result = ctx.resultString();
    Todo[] resultArray = JavalinJson.fromJson(result, Todo[].class);
    assertEquals(2, resultArray.length);
    for(Todo todo: resultArray){
      assertTrue(todo.category == "homework");
    }
  }

  @Test
  public void GetTodosByMultipleCriteria() throws IOException {

    mockReq.setQueryString("owner=Fred&body=cool");
    Context ctx = ContextUtil.init(mockReq, mockRes, "api/todos");

    todoController.getTodos(ctx);
    assertEquals(200, mockRes.getStatus());

    String result = ctx.resultString();
    Todo[] resultArray = JavalinJson.fromJson(result, Todo[].class);
    assertEquals(1, resultArray.length);
    Todo resultTodo = resultArray[0];
    assertEquals("Fred", resultTodo.owner);
    assertTrue(resultTodo.body.contains("cool"));
  }

  @Test
  public void GetNoTodos() throws IOException {

    mockReq.setQueryString("owner=nobody");
    Context ctx = ContextUtil.init(mockReq, mockRes, "api/todos");

    todoController.getTodos(ctx);
    assertEquals(200, mockRes.getStatus());

    String result = ctx.resultString();
    Todo[] resultArray = JavalinJson.fromJson(result, Todo[].class);
    assertEquals(0, resultArray.length);

  }

}
