import React, { useState } from "react"
import { useNavigate, Link, Navigate } from "react-router-dom"

const SignUp = () => {

    const [form, setForm] = useState({firstname:"", lastname:"", email:"", password:"", confirmpassword:""})
    const [error, setError] = useState({})
    const [isSubmitting, setIsSubmitting] = useState(false)

    const navigate = useNavigate()

    const handleSubmit = async (e) => {
        e.preventDefault()

        try{
            const response = await fetch('/api/signup', {
                method: 'POST',
                headers: {'content-type':'application/json'},
                body: JSON.stringify(form)
            })
            if(!response.ok){
            const errData = await response.json()
            setError({form: errData.message || "Login failed"})
            return

            }
            navigate('/login')
        }catch(err) {
            setError({form:'Network error-please try again'})
        }finally{
            setIsSubmitting(false)
        }

    }

    return(
        <div className="flex items-center justify-center bg-purple-100 min-h-screen ">
            <form  onSubmit={handleSubmit}>
                <div className="flex flex-col items-start py-4 space-y-4">
                    <h3 className="w-full font-semibold text-2xl mb-2">Sign Up</h3>
                    <div className="w-[500px]">
                        <input type="text" 
                        value={form.firstname}
                        name="firstname"
                        onChange={e => setForm(f=> ({ ...f,
                            [e.target.name]: e.target.value
                        }))}
                        className="w-full px-3 py-2 rounded-lg border border-gray-200 bg-white text-gray-900  focus:outline-none focus:ring-2 focus:ring-indigo-500" placeholder="First name" />
                    </div>

                    <div className="w-[500px]">
                        <input type="text"  
                        name="lastname"
                        onChange={e => setForm(f=> ({ ...f,
                            [e.target.name]: e.target.value
                        }))}
                        value={form.lastname}
                        className="w-full px-3 py-2 rounded-lg border border-gray-200 bg-white text-gray-900  focus:outline-none focus:ring-2 focus:ring-indigo-500" placeholder="Last name" />
                    </div>

                    <div className="w-[500px]">
                        <input type="text" 
                        name="email"
                        onChange={e => setForm(f=> ({ ...f,
                            [e.target.name]: e.target.value
                        }))}
                        value={form.email}
                        className="w-full px-3 py-2 rounded-lg border border-gray-200 bg-white focus:outline-none focus:ring-2  focus:ring-indigo-500" placeholder="Email" />
                    </div>

                    <div className="w-[500px]">
                        <input type="text" 
                        name="password"
                        onChange={e => setForm(f=> ({ ...f,
                            [e.target.name]: e.target.value
                        }))}
                        value={form.password}
                        className="w-full px-3 py-2 rounded-lg border border-gray-200 bg-white focus:outline-none focus:ring-2  focus:ring-indigo-500" placeholder="Password" />
                    </div>

                    <div className="w-[500px]">
                        <input type="text"
                         name="confirmpassword"
                         onChange={e => setForm(f=> ({ ...f,
                             [e.target.name]: e.target.value
                         }))}
                         value={form.confirmpassword}
                         className="w-full px-3 py-2 rounded-lg border border-gray-200 bg-white focus:outline-none focus:ring-2  focus:ring-indigo-500" placeholder="Confirm Password"  />
                    </div>

                    <button type='submit' disabled={isSubmitting} className=" bg-purple-700 text-white font-semibold rounded-xl shadow-md px-7 py-2.5 text-sm 
                     focus:outline-none focus:ring-2 focus:ring-purple-500">
                       {isSubmitting ? 'signing up...' : 'Sign up'}
                    </button>

                    <p className="text-sm font-medium ml-1 hover:underline hover:text-purple-900 transition-colors">Already have an account?<Link to='/login'>Login</Link> </p>
                </div>
            </form>
        </div>
    )

}
export default SignUp