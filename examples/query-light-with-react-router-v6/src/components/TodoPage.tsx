import { Link, useParams } from "react-router-dom";
import Todo from "./Todo";
import { useQueryLight } from "@rime-ui/query-light";


export type TodoType = {
  id: number;
  userId: number;
  title: string;
  isCompleted: boolean;
}

export default function TodoPage() {
  const { id } = useParams();
  const { data: todo, isLoading } = useQueryLight<TodoType>(["todo", id], async () => {
    const res = await fetch(`https://jsonplaceholder.typicode.com/todos/${id}`);
    const data = await res.json();

    return data;
  });

  if (isLoading) return <h1>Fetching todo {id}...</h1>;


  return (
    <>
      <Todo {...todo} />
      <Link to={"/"}>Back to Home</Link>
    </>
  );
}
