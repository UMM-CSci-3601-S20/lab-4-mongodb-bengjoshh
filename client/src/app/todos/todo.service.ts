import { HttpClient, HttpParams, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Todo, TodoStatus } from './todo';
import { map } from 'rxjs/operators';

@Injectable()
export class TodoService {
  readonly todoURL: string = environment.API_URL + 'todos';

  constructor(private httpClient: HttpClient) {

  }

  getTodos(filters?: { status?: string, owner?: string, body?: string, category?: string }): Observable<Todo[]> {
    let httpParams: HttpParams = new HttpParams();
    if (filters) {
      if (filters.status) {
        httpParams = httpParams.set('status', filters.status);
      }

      if (filters.owner) {
        httpParams = httpParams.set('owner', filters.owner);
      }

      if (filters.body) {
        httpParams = httpParams.set('body', filters.body);
      }

      if (filters.category) {
        httpParams = httpParams.set('category', filters.category);
      }
    }
    return this.httpClient.get<Todo[]>(this.todoURL, {
      params: httpParams,
    });
  }

  getTodoByID(id: string): Observable<Todo> {
    return this.httpClient.get<Todo>(this.todoURL + '/' + id);
  }

  filterTodos(todos: Todo[], filters: {owner?: string, body?: string, category?: string}): Todo[] {
    let filteredTodos = todos;

    // Filter by owner
    if (filters.owner) {
      filters.owner = filters.owner.toLowerCase();

      filteredTodos = filteredTodos.filter(todo => {
        return todo.owner.toLowerCase().includes(filters.owner);
      });
    }

    // Filter by body
    if (filters.body) {
      filters.body = filters.body.toLowerCase();

      filteredTodos = filteredTodos.filter(todo => {
        return todo.body.toLowerCase().includes(filters.body);
      });
    }

    // Filter by category
    if (filters.category) {
      filters.category = filters.category.toLowerCase();

      filteredTodos = filteredTodos.filter(todo => {
        return todo.category.toLowerCase().includes(filters.category);
      });
    }

    return filteredTodos;
  }

  addTodo(newTodo: Todo): Observable<string> {
    // Send post request to add a new todo with the user data as the body.
    return this.httpClient.post<{id: string}>(this.todoURL + '/new', newTodo).pipe(map(res => res.id));
  }

}
