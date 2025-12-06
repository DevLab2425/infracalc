export class MyComponent extends HTMLElement {
  constructor() {
    super();
    
    const myP = document.createElement('p');
    myP.textContent = 'helloworld';
    
    this.append(myP);
  }
}