import { Link } from 'react-router-dom';

function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-secondary-50">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            🏪 The Local Loop
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            AI-Powered Hyperlocal Commerce Platform
          </p>
          <div className="flex gap-4 justify-center">
            <Link to="/login" className="btn-primary">
              Login
            </Link>
            <Link to="/register" className="btn-secondary">
              Register
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Home;
