import { LoadingType, Todo } from '../types';

export const makeLoadingObject = (arr: Todo[]): LoadingType => {
  return arr.reduce((acc: LoadingType, curr: Todo): LoadingType => {
    return {
      ...acc,
      [curr.id]: curr.id,
    };
  }, {} as LoadingType);
};
