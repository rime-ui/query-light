import { Link } from "react-router-dom";
import { useQueryLight } from "@rime-ui/query-light";
import { TodoType } from "./TodoPage";



export default function Todo({ id, isCompleted, title, userId }: TodoType) {
  useQueryLight(["todo", id], async () => {
    const res = await fetch(`https://jsonplaceholder.typicode.com/todos/${id}`);
    const data = await res.json();

    return data;
  });


  return (
    <div>
      <h1 style={{ color: isCompleted ? "green" : "red" }}>
        {id} - {title}
      </h1>

      <p>User ID: {userId}</p>

      <Link to={`/todo/${id}`}>View Todo</Link>

      <hr />
    </div>
  );
}
