import { Link } from "react-router-dom"
import { useQueryLight } from "../../../packages/query-light/src"
import { Todo as TodoType } from "./types"
import Todo from "./components/Todo"
function App() {
  const { data: todos, isLoading } = useQueryLight<TodoType[]>(["todos"], async () => {
    const res = await fetch("https://jsonplaceholder.typicode.com/todos")
    const data = await res.json()

    return data
  })

  if (isLoading) return <h1>Fetching todos...</h1>


  return (
    <>
      <div>
        {
          todos?.map((todo) => <Todo key={todo.id} {...todo} />)
        }
      </div>

      <br />

      <Link to={"/send-msg"}>Go send page</Link>
    </>
  )
}

export default App
