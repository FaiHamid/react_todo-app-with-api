import { Filters, Todo } from '../types';

export const handleFilteredTodos = (todos: Todo[], filter: Filters) => {
  const filtrTodos = [...todos];

  switch (filter) {
    case Filters.Active:
      return filtrTodos.filter(todo => !todo.completed);

    case Filters.Completed:
      return filtrTodos.filter(todo => todo.completed);

    case Filters.All:
    default:
      return filtrTodos;
  }
};
