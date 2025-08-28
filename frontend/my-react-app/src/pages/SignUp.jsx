import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";

const SignUp = () => {
  const [form, setForm] = useState({
    firstname: "",
    lastname: "",
    email: "",
    password: "",
    confirm_password: "",
  });
  const [error, setError] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (form.password !== form.confirm_password) {
      setError({ form: "Passwords do not match" });
      return;
    }

    setIsSubmitting(true);
    setError({});

    try {
      const response = await fetch("http://localhost:5002/signup", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(form),
      });

      if (!response.ok) {
        const errData = await response.json();
        setError({ form: errData.message || "Signup failed" });
        return;
      }

      navigate("/login");
    } catch (err) {
      setError({ form: "Network error — please try again" });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex items-center justify-center bg-purple-100 min-h-screen px-4">
      <form autoComplete="off"
        onSubmit={handleSubmit}
        className="w-full max-w-2xl bg-purple-100 p-6"
      >
        <div className="flex flex-col space-y-4">
          <h3 className="text-2xl font-semibold mb-2">Sign Up</h3>

          <input
            type="text"
            name="firstname"
            value={form.firstname}
            onChange={(e) =>
              setForm((f) => ({ ...f, [e.target.name]: e.target.value }))
            }
            className="w-full px-3 py-2 rounded-lg border border-gray-200 bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder="First name"
            requied
          />

          <input
            type="text"
            name="lastname"
            value={form.lastname}
            onChange={(e) =>
              setForm((f) => ({ ...f, [e.target.name]: e.target.value }))
            }
            className="w-full px-3 py-2 rounded-lg border border-gray-200 bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder="Last name"
            required
          />

          <input
            type="email"
            name="email"
            value={form.email}
            onChange={(e) =>
              setForm((f) => ({ ...f, [e.target.name]: e.target.value }))
            }
            className="w-full px-3 py-2 rounded-lg border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder="Email"
            required
          />

          <input
            type="password"
            name="password"
            value={form.password}
            onChange={(e) =>
              setForm((f) => ({ ...f, [e.target.name]: e.target.value }))
            }
            className="w-full px-3 py-2 rounded-lg border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder="Password"
            required
          />

          <input
            type="password"
            name="confirm_password"
            value={form.confirm_password}
            onChange={(e) =>
              setForm((f) => ({ ...f, [e.target.name]: e.target.value }))
            }
            className="w-full px-3 py-2 rounded-lg border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder="Confirm Password"
            required
          />

          {error.form && (
            <p className="text-red-600 text-sm font-medium">
              {error.form}
            </p>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="bg-purple-700 text-white font-semibold rounded-xl shadow-md px-7 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            {isSubmitting ? "Signing up..." : "Sign up"}
          </button>

          <p className="text-sm font-medium hover:underline hover:text-purple-900 transition-colors">
            Already have an account? <Link to="/login">Login</Link>
          </p>
        </div>
      </form>
    </div>
  );
};

export default SignUp;
