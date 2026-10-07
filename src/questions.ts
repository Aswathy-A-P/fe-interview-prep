export interface Question {
  number: number;
  title: string;
  path: string;
}

export const questions: Question[] = [
  { number: 1, title: 'Todo App', path: '/todo' },
  { number: 2, title: 'Live Search', path: '/search' },
  { number: 3, title: 'Registration Wizard', path: '/register' },
  { number: 4, title: 'Data Table', path: '/table' },
  { number: 5, title: 'Login & Session Handling', path: '/account' },
];
