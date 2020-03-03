import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { Todo } from '../app/todos/todo';
import { TodoService } from '../app/todos/todo.service';

/**
 * A "mock" version of the `TodoService` that can be used to test components
 * without having to create an actual service.
 */
@Injectable()
export class MockTodoService extends TodoService {
  static testTodos: Todo[] = [
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

  constructor() {
    super(null);
  }

  getTodos(filters: { status?: string, owner?: string, category?: string }): Observable<Todo[]> {
    // Just return the test Todos regardless of what filters are passed in
    return of(MockTodoService.testTodos);
  }

  getTodoById(id: string): Observable<Todo> {
    // If the specified ID is for the first test todo,
    // return that todo, otherwise return `null` so
    // we can test illegal todo requests.
    if (id === MockTodoService.testTodos[0]._id) {
      return of(MockTodoService.testTodos[0]);
    } else {
      return of(null);
    }
  }

}
