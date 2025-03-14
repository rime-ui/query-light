import { Link } from "react-router-dom"
import { useQueryLight } from "../../../../packages/query-light/src"
function App() {
  const { data } = useQueryLight(["1"], () => fetch("http://localhost/api/messages").then(res => res.json()), { socketUrl: `ws://localhost:5050`, isWebSocket: true })

  console.log(data)

  return (
    <>
      <div>
        {JSON.stringify(data)}
      </div>

      <br />

      <Link to={"/send-msg"}>Go send page</Link>
    </>
  )
}

export default App
