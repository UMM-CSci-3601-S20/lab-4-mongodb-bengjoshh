import { HttpClient, HttpParams, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Todo } from './todo';
import { map } from 'rxjs/operators';

@Injectable()
export class TodoService {
  readonly todoURL: string = environment.API_URL + "todos";

  constructor(private httpClient: HttpClient){

  }

  getTodos(){

  }

  getTodoByID(){

  }

  filterTodos(){

  }

  addTodo(){

  }

}
