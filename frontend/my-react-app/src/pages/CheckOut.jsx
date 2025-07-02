import React, { useState } from "react";


const CheckOut = () => {
    const [loading, setLoading] = useState(false)
    const [email, setEmail] = useState('')
    const [amount, setAmount] = useState('')
    const [error, setError] = useState(null)

    
    const handleSubmit = async () => {
      setLoading(true)
      setError(null)

    try {
    const response = await fetch('http://localhost:5002/payment', {
      method: 'POST',
      headers: {'content-type' : 'application/json'},
      body: JSON.stringify({
        email,
        amount: Number(amount),
        }),
    })
    if (!response.ok) {
        throw new Error('Network issue or payment service error')
    }

    const {authorization_url} = await response.json();
    
    window.location.href = authorization_url

}catch(err){
    setLoading(false);
    console.error('payment init failed:', err);
    setError('payment initialization failed. please try again');
    }
    finally{
        setLoading(false)
    }     
}
  return(
    <div>

        <input type="email" placeholder="email" value={email} 
             onChange={(e =>setEmail(e.target.value))}/>
        
        <input type="number" placeholder="amount" value={amount} 
        onChange={(e) =>setAmount(e.target.value)}/>

        <button onClick={handleSubmit} disabled={loading} >
        {loading? 'processing..' : 'Pay Now'}
        {error && <p style={{color:'red'}}>{error}</p>}
        </button>
        </div>
  )         
}


export default CheckOut