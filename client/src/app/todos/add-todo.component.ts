import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { Todo } from './todo';
import { TodoService } from './todo.service';

@Component({
  selector: 'app-add-todo',
  templateUrl: './add-todo.component.html',
})

export class AddTodoComponent implements OnInit {

  addTodoForm: FormGroup;

  todo: Todo;

  constructor(private fb: FormBuilder, private todoService: TodoService, private snackBar: MatSnackBar, private router: Router) {
  }

  add_todo_validation_messages = {
    owner: [
      {type: 'required', message: 'owner is required'},
      {type: 'pattern', message: 'Name must contain only numbers and letters'},
      {type: 'existingOwner', message: 'Owner has already been taken'}
    ],

    status: [
      {type: 'pattern', message: 'status must be a complete or incomplete'},
      {type: 'required', message: 'status is required'}
    ],

    category: [
      {type: 'category', message: 'Category must contain only letters'},
    ],
  };

  createForms() {

    // add todo form validations
    this.addTodoForm = this.fb.group({
      // We allow alphanumeric input and limit the length for owner.
      owner: new FormControl('', Validators.compose([
        Validators.required,
        Validators.pattern('^[A-Za-z0-9\\s]+$'),
        (fc) => {
          if (fc.value.toLowerCase() === 'abc123' || fc.value.toLowerCase() === '123abc') {
            return ({existingOwner: true});
          } else {
            return null;
          }
        },
      ])),

      // Since this is for a status, we need complete or incomplete.
      status: new FormControl('', Validators.compose([
        Validators.required,
        Validators.pattern('^(complete|incomplete)$'),
      ])),

      // We don't care much about what is in the body field, so we just add it here as part of the form
      // without any particular validation.
      body: new FormControl(),

      // We don't need a special validator just for our app here, but there is a default one for email.
      // We will require the email, though.
      category: new FormControl('', Validators.compose([
        Validators.required,
        Validators.pattern('^[A-Za-z\\s]+$'),
      ])),

    });

  }
  ngOnInit() {
    this.createForms();
  }

  submitForm() {
    this.todoService.addTodo(this.addTodoForm.value).subscribe(newID => {
      this.snackBar.open('Added Todo ' + this.addTodoForm.value.owner, null, {
        duration: 2000,
      });
      this.router.navigate(['/todos/', newID]);
    }, err => {
      this.snackBar.open('Failed to add the todo', null, {
        duration: 2000,
      });
    });
  }

}
