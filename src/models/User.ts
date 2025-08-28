export type Role = "סטודנט" | "מנהל";

export default class User {
  id: number;
  name: string;
  email: string;
  role: Role;

  constructor(id: number, name: string, email: string, role: Role) {
    this.id = id;
    this.name = name;
    this.email = email;
    this.role = role;
  }

  // Build a User object from plain object (useful when loading from localStorage)
  static from(obj: any): User {
    return new User(Number(obj.id), String(obj.name), String(obj.email), obj.role as Role);
  }

  // Convert to plain object (for saving into localStorage)
  toJSON() {
    return { id: this.id, name: this.name, email: this.email, role: this.role };
  }
}
