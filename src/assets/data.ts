export interface Student {
  id: number;
  name: string;
  age: number;
  grade: string;
}

export const students: Student[] = [
  { id: 1, name: "אדל", age: 21, grade: "A" },
  { id: 2, name: "אליטה", age: 22, grade: "B" },
  { id: 3, name: "דניאל", age: 20, grade: "A" },
  { id: 4, name: "שרה", age: 23, grade: "C" },
];
