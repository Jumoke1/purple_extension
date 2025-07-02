import { CheckCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
const Success = () => {
    
return (
    <div className="min-h-screen flex items-center justify-center bg-purple-100">
      <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md w-full text-center">
        <CheckCircle className="text-green-500 mx-auto mb-4" size={60} />
        <h2 className="text-2xl font-bold mb-2 text-gray-800">Payment Successful</h2>
        <p className="text-gray-600 mb-6">
          Your payment has been processed successfully.
        </p>
       <Link to='/homepage' ><button className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded transition duration-200">
          Back to Home
        </button>
        </Link> 
      </div>
    </div>
  );
}
export default Success;