// src/models/Topic.ts

export default class Topic {
  id: string;
  code: string;   // short identifier, e.g. "ADM", "TECH"
  label: string;  // human-readable name
  isActive: boolean;

  constructor(id: string, code: string, label: string, isActive: boolean = true) {
    this.id = id;
    this.code = code;
    this.label = label;
    this.isActive = isActive;
  }

  // Create a Topic instance from a plain object (e.g. from localStorage)
  static from(obj: any): Topic {
    return new Topic(
      String(obj?.id ?? ""),
      String(obj?.code ?? ""),
      String(obj?.label ?? ""),
      Boolean(obj?.isActive ?? true)
    );
  }

  // Convert the Topic instance back to a plain object (for saving to localStorage)
  toJSON() {
    return {
      id: this.id,
      code: this.code,
      label: this.label,
      isActive: this.isActive,
    };
  }
}
