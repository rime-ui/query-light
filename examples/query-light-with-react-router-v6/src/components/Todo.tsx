import { Link } from "react-router-dom";
import { Todo as TodoType } from "../types";

export default function Todo({ id, isCompleted, title, userId }: TodoType) {
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
