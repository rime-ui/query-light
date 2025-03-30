import { Link } from "react-router-dom";
import { Todo as TodoType } from "../types";
import { useQueryLight } from "@rime-ui/react-query-light";



export default function Todo({ id, isCompleted, title, userId }: TodoType) {
  const { prefetchProps } = useQueryLight(["todo", id], async () => {
    const res = await fetch(`https://jsonplaceholder.typicode.com/todos/${id}`);
    const data = await res.json();

    return data;
  }, { prefetch: true });


  return (
    <div>
      <h1 style={{ color: isCompleted ? "green" : "red" }}>
        {id} - {title}
      </h1>

      <p>User ID: {userId}</p>

      <Link {...prefetchProps} to={`/todo/${id}`}>View Todo</Link>

      <hr />
    </div>
  );
}
