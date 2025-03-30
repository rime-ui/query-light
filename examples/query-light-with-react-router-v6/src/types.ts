export type Todo = {
  id: number;
  userId: number;
  isCompleted: boolean;
  title: string;
  prefetchProps: {
    onMouseEnter: () => void;
  }
};
