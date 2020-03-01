import { Component, OnInit, OnDestroy } from '@angular/core';
import { Todo } from './todo';
import { TodoService } from './todo.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-todo-list-component',
  templateUrl: 'todo-list.component.html',
  providers: [],
})

export class TodoListComponent implements OnInit, OnDestroy {

  ngOnInit() {

  }

  ngOnDestroy() {

  }

}
