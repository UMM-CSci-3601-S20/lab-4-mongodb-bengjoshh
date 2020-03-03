import { Component, OnInit, OnDestroy } from '@angular/core';
import { Todo, TodoStatus } from './todo';
import { TodoService } from './todo.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-todo-list-component',
  templateUrl: 'todo-list.component.html',
  providers: [],
})

export class TodoListComponent implements OnInit, OnDestroy {

   // These are public so that tests can reference them (.spec.ts)
   public serverFilteredTodos: Todo[];
   public filteredTodos: Todo[];

   public todoOwner: string;
   public todoStatus: 'complete' | 'incomplete' | '';
   public todoBody: string;
   public todoCategory: string;
   public viewType: 'card' | 'list' = 'card';
   getTodosSub: Subscription;

  constructor(private todoService: TodoService) {
  }

  getTodosFromServer(): void {
    this.todoService.getTodos({
      status: this.todoStatus,
    }).subscribe(returnedTodos => {
      this.serverFilteredTodos = returnedTodos;
      this.updateFilter();
    }, err => {
      console.log(err);
    });
  }

  public updateFilter(): void {
    this.filteredTodos = this.todoService.filterTodos(
      this.serverFilteredTodos, { owner: this.todoOwner, category: this.todoCategory, body: this.todoBody });
  }

  ngOnInit() {
    this.getTodosFromServer();
  }

  ngOnDestroy() {
    this.unsub();
  }

  unsub(): void {
    if (this.getTodosSub) {
      this.getTodosSub.unsubscribe();
    }
  }

}
