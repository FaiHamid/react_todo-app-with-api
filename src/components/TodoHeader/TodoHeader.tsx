import React, { useEffect, useRef, useState } from 'react';
import cn from 'classnames';
import { Todo } from '../../types';
import { USER_ID } from '../../api/todos';

interface Props {
  tempTodo: Todo | null;
  todos: Todo[];
  onToggleTodos: () => void;
  onChangeTempTodo: (val: Todo | null) => void;
  onErrorMessage: (val: string) => void;
  onSubmit: (todo: Todo) => Promise<Todo | void>;
}

export const TodoHeader: React.FC<Props> = ({
  tempTodo,
  todos,
  onToggleTodos,
  onChangeTempTodo,
  onErrorMessage,
  onSubmit,
}) => {
  const [value, setValue] = useState('');
  const isAllCompleted = todos.every(todo => todo.completed);
  const titleField = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (titleField.current && tempTodo === null) {
      titleField.current.focus();
    }
  }, [tempTodo, todos.length]);

  const addingTodo = (event: React.FormEvent<HTMLElement>) => {
    event.preventDefault();

    if (!value.trim()) {
      onErrorMessage('Title should not be empty');

      return;
    }

    const newTodo = {
      id: 0,
      userId: USER_ID,
      title: value.trim(),
      completed: false,
    };

    let flag = 0;

    onSubmit(newTodo)
      .catch(() => {
        onErrorMessage('Unable to add a todo');
        flag = 1;
      })
      .finally(() => {
        if (flag !== 1) {
          setValue('');
        }

        onChangeTempTodo(null);
      });
  };

  return (
    <header className="todoapp__header">
      {!!todos.length && (
        <button
          type="button"
          className={cn('todoapp__toggle-all', { active: isAllCompleted })}
          data-cy="ToggleAllButton"
          onClick={onToggleTodos}
        />
      )}

      <form onSubmit={addingTodo}>
        <input
          data-cy="NewTodoField"
          type="text"
          className="todoapp__new-todo"
          placeholder="What needs to be done?"
          ref={titleField}
          disabled={Boolean(tempTodo)}
          value={value}
          onChange={event => setValue(event.target.value)}
        />
      </form>
    </header>
  );
};
