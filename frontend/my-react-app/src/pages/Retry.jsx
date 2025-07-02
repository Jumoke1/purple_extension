import { XCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

const Retry = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-purple-100">
      <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md w-full text-center">
        <XCircle className="text-red-500 mx-auto mb-4" size={60} />
        <h2 className="text-2xl font-bold mb-2 text-gray-800">Payment Failed</h2>
        <p className="text-gray-600 mb-6">
          Unfortunately, your payment could not be processed. Please try again.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button className="bg-red-500 hover:bg-red-600 text-white px-6 py-2 rounded transition duration-200">
            Retry Payment
          </button>
          <Link to="/homepage"> <button className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-6 py-2 rounded transition duration-200">
            Back to Home
          </button> 
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Retry;
