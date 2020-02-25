package umm3601.todo;

import org.mongojack.Id;
import org.mongojack.ObjectId;

public class Todo {
    @ObjectId @Id
    Public String _id;

    Public String owner;
    Public boolean status;
    Public String body;
    Public String category; 
}