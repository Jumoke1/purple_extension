import React from "react";
import { useState } from "react";
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";


const Login = () => {
    
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [form, setForm] = useState({ email: "", password: "" });

    const [errors, setErrors]= useState({})
    const navigate = useNavigate()

    const handleSubmit = async (e)=>  {
        e.preventDefault();

        setErrors({})
        setIsSubmitting(true)

     try{
        const response = await fetch('http://localhost:5002/admin/login', {
            method: 'POST',
            headers: {'Content-type': 'application/json'},
            body: JSON.stringify(form)
        })

        const data = await response.json() 

        if(!response.ok){
            const errData = await response.json()
            setErrors({form: data.message || data.error || "Login failed"})
            return
        }
        console.log('login not successfulll')

        localStorage.setItem('token', data.access_token);
        localStorage.setItem('user', JSON.stringify(data.user))
        console.log('failed login')
        navigate('/admindashboard')

     }catch (err) {
        setErrors({form:'Network error-please try again'})
     } finally {
        setIsSubmitting(false)
     }

    }                  

    return(
        <div className="flex items-center px-4 bg-purple-100 justify-center min-h-screen">
        <form onSubmit={handleSubmit} 
         className="w-full max-w-2xl bg-purple-100 p-6">
        <div className=" flex flex-col py-4 space-y-4" >
            <h3 className="font-semibold text-2xl mb-2">Sign In</h3>
          
            <input
            type="email"
            value={form.email}
            onChange={(e) => setForm({...form, email: e.target.value})}
            placeholder="Email"
            className="w-full px-3 py-2 rounded-lg border border-gray-200 bg-white text-gray-900  focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
           
       
            <input type="password" 
             value={form.password} placeholder="password"
             onChange={(e) => setForm({ ...form, password: e.target.value })}
             className="w-full px-3 py-2 rounded-lg border border-gray-200 bg-white text-gray-900  focus:outline-none focus:ring-2 focus:ring-indigo-500"/>
            </div>
                {errors.form && <p className="error">{errors.form}</p>}

            <button type='submit'  disabled={isSubmitting} className=" bg-purple-700 text-white font-semibold rounded-xl shadow-md px-7 py-2.5 text-sm p-2
            focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-50">{isSubmitting ? 'Logging in…' : 'Log In'}
            </button>
            <p className="text-sm font-medium ml-1 hover:underline hover:text-purple-900 transition-colors">Don't have an account?<Link to ="/signup">Sign Up</Link></p>
    
        </form>
        </div>
    )

}

export default Login;