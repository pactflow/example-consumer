export interface ProductData {
  id: string;
  name: string;
  type: string;
}

export class Product {
  id: string;
  name: string;
  type: string;

  constructor({ id, name, type }: ProductData) {
    this.id = id;
    this.name = name;
    this.type = type;
  }
}
