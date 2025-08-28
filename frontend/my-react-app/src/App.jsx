import './App.css'
import { BrowserRouter as Router, Routes, Route, useLocation, Outlet } from "react-router-dom"
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import AdminDashboard from './pages/AdminDashboard'
import NewInStore from './pages/Newinstore'
import Collections from './pages/Collections'
import SalesProduct from './pages/AboutUs'
import ContactUs from './pages/ContactUs'
import HomePage from './pages/HomePage';
import Layout from './components/Layout'
import CheckOut from './pages/CheckOut'
import VerifyPayment from './pages/VerifyPayment'
import Retry from './pages/Retry'
import SingleProductpage from './pages/SingleProductpage'
import Success from './pages/success'
import Login from './pages/Login'
import SignUp from './pages/SignUp'
import AddnewProduct from './pages/AddnewProduct'
import ProductManagement from './pages/productManagement'
import EditProduct from './pages/EditProduct'
import AboutUs from './pages/AboutUs'
import SingleorderDetails from './pages/SingleorderDetails'
import NewOrder from './pages/NewOrders'
import ClientComplaint from './pages/ClientComplaint'

import CartDrawer from './components/CartDrawer'


function LayoutWrapper(){
	const location = useLocation()
	const hideLayout = location.pathname  === '/login' || location.pathname === '/signup' || location.pathname ==='/addnewproduct'
	|| location.pathname ==='/productmanagement' || location.pathname ==='/editproduct/:id';

	if (hideLayout) return <Outlet />
	return <Layout><Outlet /></Layout>

}

function App() {


	  return (
		<Router>
			<Routes>
        		<Route path='/' element={<LayoutWrapper/>}>
				{/*Routes without layout */}
				 <Route path="login" element={<Login/>}/>
				 <Route path="signup" element={<SignUp/>}/>
				 <Route path='/addnewproduct'element={<AddnewProduct/>}/>
				 <Route path='/productmanagement'element={<ProductManagement/>}/>
				 <Route path='/editproduct/:id'element={<EditProduct/>}/>
				 

				  {/* Routes with layout */}
			    <Route path='/homepage'element={<HomePage/>} />
					<Route path='/admindashboard' element={<AdminDashboard />} />
					<Route path='/collections' element={<Collections/>} />
					<Route path="/salesproduct" element={<SalesProduct />} />
          			<Route path="/newinstock" element={<NewInStore />} />
					<Route path="/checkout" element={<CheckOut />} />
					<Route path="/verifypayment" element={<VerifyPayment />} />
					<Route path="/retry" element={<Retry/>} />
					<Route path="/success" element={<Success/>} />
					<Route path='/singleproductpage/:id' element={<SingleProductpage/>} />
					<Route path='/contactus' element={<ContactUs/>} />
					<Route path='/aboutus' element={<AboutUs/>} />
					<Route path='/singleorderdetails/:orderId' element={<SingleorderDetails/>} />
					<Route path='/neworder' element={<NewOrder/>} />
					<Route path='/clientcomplaint' element={<ClientComplaint/>} />
				
          </Route>
			</Routes>
					 <ToastContainer />
		</Router>
	)
}

export default App
