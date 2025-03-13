import { useQueryLight } from "../../../packages/query-light/src/core/useQueryLight"
function App() {
  const { data, isLoading, refetch, invalidateCurrentQuery } = useQueryLight(["users", "493580345"], async () => {
    const res = await fetch("https://jsonplaceholder.typicode.com/todos/1")
    const data = await res.json()

    return data
  }, { staleTime: 3000 })

  if (isLoading) return <h1>Loaidng...</h1>

  console.log(data)
  return (
    <>
      <button onClick={refetch}>refetch</button>
      <button onClick={invalidateCurrentQuery}>invalidate</button>
    </>
  )
}

export default App
