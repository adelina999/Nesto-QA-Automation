export  class BasePage {
   constructor(protected readonly path: string) {}

  visit() {
    return cy.visit(this.path);
  }
 
}