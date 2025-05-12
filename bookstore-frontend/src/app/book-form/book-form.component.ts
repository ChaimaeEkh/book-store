import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { Book, BookService } from '../book.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';

@Component({
  selector: 'app-book-form',
  templateUrl: './book-form.component.html',
  styleUrls: ['./book-form.component.css'],
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatCardModule
  ]
})
export class BookFormComponent implements OnInit {
  bookForm: FormGroup;
  book: Book = { title: '', author: '', price: 0, description: '' };
  isSubmitting = false;

  constructor(
    private fb: FormBuilder,
    private bookService: BookService,
    private router: Router,
    private route: ActivatedRoute,
    private snackBar: MatSnackBar
  ) {
    this.bookForm = this.fb.group({
      title: ['', [Validators.required, Validators.maxLength(100)]],
      author: ['', [Validators.required, Validators.maxLength(100)]],
      price: [0, [Validators.required, Validators.min(0)]],
      description: ['', [Validators.maxLength(500)]]
    });
  }

  ngOnInit(): void {
    const id = this.route.snapshot.params['id'];
    if (id) {
      this.bookService.getBook(id).subscribe({
        next: (book) => {
          this.book = book;
          this.bookForm.patchValue(book);
        },
        error: (error) => {
          this.snackBar.open('Error loading book details!', 'Close', {
            duration: 3000,
            horizontalPosition: 'end',
            verticalPosition: 'top'
          });
          this.router.navigate(['/books']);
        }
      });
    }
  }

  onSubmit() {
    if (this.bookForm.valid) {
      this.isSubmitting = true;
      const bookData = { ...this.book, ...this.bookForm.value };

      const request = this.book.id ?
        this.bookService.updateBook(bookData) :
        this.bookService.addBook(bookData);

      request.subscribe({
        next: () => {
          this.snackBar.open(
            `Book ${this.book.id ? 'updated' : 'added'} successfully!`,
            'Close',
            {
              duration: 3000,
              horizontalPosition: 'end',
              verticalPosition: 'top'
            }
          );
          this.router.navigate(['/books']);
        },
        error: (error) => {
          this.isSubmitting = false;
          this.snackBar.open(
            `Error ${this.book.id ? 'updating' : 'adding'} book!`,
            'Close',
            {
              duration: 3000,
              horizontalPosition: 'end',
              verticalPosition: 'top'
            }
          );
        }
      });
    }
  }
}
