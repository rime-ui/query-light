import { Link, useParams } from "react-router-dom"

export default function TodoPage() {
    const { id } = useParams()
    return (
        <>

            <div>TodoPage: {id}</div>

            <Link to={"/"}>Back to Home</Link>
        </>
    )
}
