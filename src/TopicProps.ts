// src/models/Topic.ts   // או השם שבו השתמשת (TopicProps.ts)
export type TopicProps = {
  id: string;
  code: string;   // מזהה קצר: "ADM" / "TECH"
  label: string;  // שם קריא
  isActive: boolean;
};

export default class Topic {
  // <<< הגדרת שדות מחוץ ל-constructor (בלי public/readonly בפרמטרים)
  id: string;
  code: string;
  label: string;
  isActive: boolean;

  constructor(id: string, code: string, label: string, isActive: boolean = true) {
    this.id = id;
    this.code = code;
    this.label = label;
    this.isActive = isActive;
  }

  static from(obj: unknown): Topic {
    const t = obj as Partial<TopicProps>;
    return new Topic(
      String(t?.id ?? ""),
      String(t?.code ?? ""),
      String(t?.label ?? ""),
      Boolean(t?.isActive ?? true)
    );
  }

  toJSON(): TopicProps {
    return { id: this.id, code: this.code, label: this.label, isActive: this.isActive };
  }
}
