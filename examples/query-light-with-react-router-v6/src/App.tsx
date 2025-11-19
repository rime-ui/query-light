import { Todo as TodoType } from "./types";
import Todo from "./components/Todo";
import { useQueryLight } from "@rime-ui/react-query-light";
function App() {
  const { data: todos, isLoading } = useQueryLight<TodoType[]>(
    ["todos"],
    async () => {
      const res = await fetch("https://jsonplaceholder.typicode.com/todos");
      const data = await res.json();

      return data;
    },

    {
      enabled: true
    }
  );

  if (isLoading) return <h1>Fetching todos...</h1>;

  return (
    <>
      <div>{todos?.map((todo) => <Todo key={todo.id} {...todo} />)}</div>

      <br />
    </>
  );
}

export default App;
