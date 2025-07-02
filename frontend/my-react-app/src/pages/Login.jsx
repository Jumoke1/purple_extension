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
        const response = await fetch('/api/login', {
            method: 'POST',
            headers: {'Content-type': 'application/json'},
            body: JSON.stringify(form)
        })
        if(!response.ok){
            const errData = await response.json()
            setErrors({form: errData.message || "Login failed"})
            return
        }
        navigate('/admindashboard')
     }catch (err) {
        setErrors({form:'Network error-please try again'})
     } finally {
        setIsSubmitting(false)
     }

    }                  

    return(
        <div className="flex items-center bg-purple-100 justify-center min-h-screen">
        <form onSubmit={handleSubmit}>
        <div className=" flex flex-col items-start py-4 space-y-4" >
            <h3 className=" w-full font-semibold text-2xl mb-2">Sign In</h3>
             <div className="w-[500px]">
            <input
            type="email"
            value={form.email}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Email"
            className="w-full px-3 py-3 rounded-lg border border-gray-200 bg-white text-gray-900  focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
           </div>

            <div className="w-[500px]">
            <input type="password"  value={form.password} placeholder="password"
            className="w-full px-3 py-3 rounded-lg border border-gray-200 bg-white text-gray-900  focus:outline-none focus:ring-2 focus:ring-indigo-500"/>
            </div>
                {errors.form && <p className="error">{errors.form}</p>}

            <button type='submit'  disabled={isSubmitting} className=" bg-purple-700 text-white font-semibold rounded-xl shadow-md px-7 py-2.5 text-sm p-2
            focus:outline-none focus:ring-2 focus:ring-purple-500">{isSubmitting ? 'Logging in…' : 'Log In'}
            </button>
            <p className="text-sm font-medium ml-1 hover:underline hover:text-purple-900 transition-colors">Don't have an account?<Link to ="/signup">Sign Up</Link></p>
        </div>
        </form>
        </div>
    )

}

export default Login;