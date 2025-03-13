import { useQueryLight } from "../../../packages/query-light/src/core/useQueryLight"

type Todo = {
  userId: number,
  id: number,
  title: string,
  completed: boolean
}

function App() {
  const { data, isLoading, refetch, invalidateCurrentQuery } = useQueryLight<Todo>(["test"], async () => {
    const res = await fetch("https://jsonplaceholder.typicode.com/todos/8")
    const data = await res.json()

    return data
  }, { staleTime: 3000 })

  if (isLoading) return <h1>Loaidng...</h1>


  return (
    <>
    <div>
      <h1>Title: {data?.title}</h1>
      <h2 style={{ color: data?.completed ? "green" : "red"}}>Completed: {String(data?.completed)}</h2>
    </div>
      <button onClick={refetch}>refetch</button>
      <button onClick={invalidateCurrentQuery}>invalidate</button>
    </>
  )
}

export default App
