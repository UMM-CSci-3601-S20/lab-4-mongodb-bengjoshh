import { HttpClient } from '@angular/common/http';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { Todo, TodoStatus } from './todo';
import { TodoService } from './todo.service';

describe('Todo service: ', () => {
  const testTodos: Todo[] = [
    {
      _id: 'bens_id',
      owner: 'Ben',
      status: true,
      body: 'feed the cat',
      category: 'chores'
    },
    {
      _id: 'joshs_id',
      owner: 'Josh',
      status: false,
      body: 'go to sleep',
      category: 'mother\'s wishes'
    },
    {
      _id: 'charlies_id',
      owner: 'Charlie',
      status: true,
      body: 'dust shelves',
      category: 'chores'
    }
  ];
  let todoService: TodoService;
  let httpClient: HttpClient;
  let httpTestingController: HttpTestingController;

  beforeEach(() => {
    httpTestingController.verify();
  });

  it('getTodos() calls api/todos', () => {
    // Assert that the todos we get from this call to getTodos()
    // should be our set of test todos.
    todoService.getTodos().subscribe(
      todos => expect(todos).toBe(testTodos)
    );

    // Specify that (exactly) one request will be made to the specified URL.
    const req = httpTestingController.expectOne(todoService.todoURL);

    expect(req.request.method).toEqual('GET');
    req.flush(testTodos);
  });

  it('getTodos() calls api/todos with filter parameter true', () => {

    todoService.getTodos({status: 'complete'}).subscribe(
      todos => expect(todos).toBe(testTodos)
    );

    // Specify that (exactly) one request will be made to the specified URL with the true parameter.
    const req = httpTestingController.expectOne(
      (request) => request.url.startsWith(todoService.todoURL) && request.params.has('status')
    );

    // Check that the request made to that URL was a GET request.
    expect(req.request.method).toEqual('GET');

    // Check that the role parameter was 'admin'
    expect(req.request.params.get('status')).toEqual('complete');

    req.flush(testTodos);
  });

  it('getTodos() calls api/todos with filter parameter false', () => {

    todoService.getTodos({ status: 'incomplete' }).subscribe(
      todos => expect(todos).toBe(testTodos)
    );

    // Specify that (exactly) one request will be made to the specified URL with the role parameter.
    const req = httpTestingController.expectOne(
      (request) => request.url.startsWith(todoService.todoURL) && request.params.has('status')
    );

    // Check that the request made to that URL was a GET request.
    expect(req.request.method).toEqual('GET');

    // Check that the status parameter was false
    expect(req.request.params.get('status')).toEqual('incomplete');

    req.flush(testTodos);
  });

  it('getTodos() calls api/todos with multiple filter parameters', () => {

    todoService.getTodos({ status: 'complete' }).subscribe(
      todos => expect(todos).toBe(testTodos)
    );

    // Specify that (exactly) one request will be made to the specified URL with the role parameter.
    const req = httpTestingController.expectOne(
      (request) => request.url.startsWith(todoService.todoURL)
        && request.params.has('owner') && request.params.has('category') && request.params.has('status')
    );

    // Check that the request made to that URL was a GET request.
    expect(req.request.method).toEqual('GET');

    // Check that the role parameters are correct
    expect(req.request.params.get('status')).toEqual('incomplete');
    expect(req.request.params.get('category')).toEqual('mother\'s wishes');
    expect(req.request.params.get('owner')).toEqual('Josh');

    req.flush(testTodos);
  });

  it('getTodoById() calls api/todos/id', () => {
    const targetTodo: Todo = testTodos[1];
    const targetId: string = targetTodo._id;
    todoService.getTodoByID(targetId).subscribe(
      todo => expect(todo).toBe(targetTodo)
    );

    const expectedUrl: string = todoService.todoURL + '/' + targetId;
    const req = httpTestingController.expectOne(expectedUrl);
    expect(req.request.method).toEqual('GET');
    req.flush(targetTodo);
  });

  it('filterTodos() filters by owner', () => {
    expect(testTodos.length).toBe(3);
    const todoOwner = 'e';
    expect(todoService.filterTodos(testTodos, { owner: todoOwner }).length).toBe(2);
  });

  it('filterTodos() filters by category', () => {
    expect(testTodos.length).toBe(3);
    const todoCategory = '\'';
    expect(todoService.filterTodos(testTodos, { category: todoCategory }).length).toBe(1);
  });

  it('filterTodos() filters by body', () => {
    expect(testTodos.length).toBe(3);
    const todoBody = 'a';
    expect(todoService.filterTodos(testTodos, { body: todoBody }).length).toBe(1);
  });


});
