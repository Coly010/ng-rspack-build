import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  imports: [FormsModule],
  selector: 'app-stateful',
  templateUrl: './stateful.component.html',
  styleUrls: ['./stateful.component.scss'],
  styles: [
    `
      div {
        margin: 1rem 0;
        border: 1px solid blue;
      }
    `,
  ],
})
export class StatefulComponent {
  name = 'World';
  age = 42;

  submit() {
    console.log('Submitted', this.name, this.age);
  }
}
