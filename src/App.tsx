import React, { useEffect, useMemo, useRef, useState } from 'react';
import { TodoList } from './components/TodoList';
import { Todo } from './types/Todo';
import { addTodo, deleteTodo, getTodos, updateTodo } from './api/todos';
import { Filters, LoadingType } from './types';
import { TodoHeader } from './components/TodoHeader';
import { TodoFooter } from './components/TodoFooter';
import { ErrorNotification } from './components/ErrorNotification';
import { makeLoadingObject } from './utils/makeLoadingObject';

export const App: React.FC = () => {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [tempTodo, setTempTodo] = useState<Todo | null>(null);

  const [errorMessage, setErrorMessage] = useState('');
  const [filter, setFilter] = useState<Filters>(Filters.All);
  const [loadingIds, setLoadingIds] = useState<LoadingType>({});

  useEffect(() => {
    getTodos()
      .then(setTodos)
      .catch(() => {
        setErrorMessage('Unable to load todos');
        // throw new Error('Unable to load todos');
      });
  }, []);

  const titleField = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (titleField.current && tempTodo === null) {
      titleField.current.focus();
    }
  }, [tempTodo, todos.length]);

  const handleAddTodo = (newTodo: Todo): Promise<Todo | void> => {
    setTempTodo(newTodo);

    return addTodo(newTodo).then(newTodoRes => {
      setTodos(prevTodos => [...prevTodos, newTodoRes]);
    });
  };

  const updateCompletedTodo = (
    updTodo: Todo,
    key: keyof Todo,
    value: boolean | string,
  ) => {
    return updateTodo({ ...updTodo, [key]: value })
      .then((respTodo: Todo) => {
        setTodos(currTodos => {
          return currTodos.map(todo =>
            todo.id === updTodo.id ? respTodo : todo,
          );
        });

        return false;
      })
      .catch(() => {
        setErrorMessage('Unable to update a todo');

        return true;
      });
  };

  const handleToggleTodos = () => {
    const isActive = todos.filter(todo => !todo.completed);
    const isActiveIds = makeLoadingObject(isActive);

    if (isActive.length > 1) {
      setLoadingIds(isActiveIds);

      Promise.all(
        isActive.map(todo => updateTodo({ ...todo, completed: true })),
      )
        .then(() =>
          setTodos(prevTodos => {
            return prevTodos.map(todo2 => {
              if (Object.hasOwn(isActiveIds, todo2.id)) {
                return { ...todo2, completed: true };
              } else {
                return todo2;
              }
            });
          }),
        )
        .catch(() => setErrorMessage('Unable to update a todo'))
        .finally(() => setLoadingIds({}));

      return;
    }

    setLoadingIds(makeLoadingObject(todos));
    Promise.all(todos.map(todo => updateTodo({ ...todo, completed: false })))
      .then(() =>
        setTodos(prevTodos => {
          return prevTodos.map(todo2 => ({ ...todo2, completed: false }));
        }),
      )
      .catch(() => setErrorMessage('Unable to update a todo'))
      .finally(() => setLoadingIds({}));
  };

  const handleDeleteCompletedTodos = () => {
    const completedTodos = todos.filter(todo => todo.completed);

    setLoadingIds(makeLoadingObject(completedTodos));

    Promise.allSettled(
      completedTodos.map(todo => deleteTodo(todo.id).then(() => todo)),
    )
      .then(values => {
        values.map(value1 => {
          if (value1.status === 'rejected') {
            setErrorMessage('Unable to delete a todo');
          } else {
            setTodos(prevTodos => {
              const todoID = value1.value as Todo;

              return prevTodos.filter(todo1 => todo1.id !== todoID.id);
            });
          }
        });
      })
      .finally(() => setLoadingIds({}));
  };

  const handleDeleteTodo = (todoID: number): Promise<void> => {
    return deleteTodo(todoID)
      .then(() => {
        setTodos(prevTodos => prevTodos.filter(todo => todo.id !== todoID));
      })
      .catch(() => {
        setErrorMessage('Unable to delete a todo');
      });
  };

  const filteredTodos = useMemo(() => {
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
  }, [filter, todos]);

  return (
    <div className="todoapp">
      <h1 className="todoapp__title">todos</h1>

      <div className="todoapp__content">
        <TodoHeader
          titleField={titleField}
          tempTodo={tempTodo}
          todos={todos}
          onToggleTodos={handleToggleTodos}
          onChangeTempTodo={setTempTodo}
          onErrorMessage={setErrorMessage}
          onSubmit={handleAddTodo}
        />

        <TodoList
          todos={filteredTodos}
          tempTodo={tempTodo}
          loadingIds={loadingIds}
          onEdit={updateCompletedTodo}
          onDelete={handleDeleteTodo}
        />

        {!!todos.length && (
          <TodoFooter
            todos={todos}
            selectedFilter={filter}
            onChangeFilter={setFilter}
            onDeleteCompleted={handleDeleteCompletedTodos}
          />
        )}
      </div>

      <ErrorNotification
        errorMessage={errorMessage}
        onCloseErrorMessage={() => setErrorMessage('')}
      />
    </div>
  );
};
