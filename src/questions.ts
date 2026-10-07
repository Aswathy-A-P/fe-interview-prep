export interface Question {
  number: number;
  title: string;
  path: string;
}

export const questions: Question[] = [
  { number: 1, title: 'Todo App', path: '/todo' },
  { number: 2, title: 'Live Search', path: '/search' },
];
