import { Link } from 'react-router-dom'

const Home = () => {
  return (
    <div className="text-center">
      <h1 className="text-4xl font-bold text-gray-900 mb-8">
        Welcome to Leelaaverse
      </h1>
      <p className="text-xl text-gray-600 mb-8">
        The future of AI-powered social networking
      </p>
      <div className="space-x-4">
        <Link
          to="/register"
          className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700"
        >
          Get Started
        </Link>
        <Link
          to="/login"
          className="bg-gray-200 text-gray-800 px-6 py-3 rounded-lg hover:bg-gray-300"
        >
          Sign In
        </Link>
      </div>
    </div>
  )
}

export default Home
