export interface Question {
  number: number;
  title: string;
  path: string;
  summary: string;
}

export const questions: Question[] = [
  {
    number: 1,
    title: 'Todo App',
    path: '/todo',
    summary: 'Add, edit, filter and reorder todos that survive a page refresh.',
  },
  {
    number: 2,
    title: 'Live Search',
    path: '/search',
    summary: 'Debounced product search that always shows results for the latest query.',
  },
  {
    number: 3,
    title: 'Registration Wizard',
    path: '/register',
    summary: 'A three-step form with validation, a review step and saved progress.',
  },
  {
    number: 4,
    title: 'Data Table',
    path: '/table',
    summary: 'A reusable table with sorting, search, filters and a shareable URL view.',
  },
  {
    number: 5,
    title: 'Login & Session Handling',
    path: '/account',
    summary: 'Short-lived tokens that refresh silently, with protected and admin-only pages.',
  },
];
