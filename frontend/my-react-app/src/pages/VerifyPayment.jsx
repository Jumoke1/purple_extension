import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

const VerifyPayment = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const reference = searchParams.get('reference');  // typo fix: 'refrence' → 'reference'

  useEffect(() => {
    if (!reference) {
      navigate('/retry');
      return;
    }
    alert('verifying payment...');

    fetch('http://localhost:5002/VerifyPayment', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ reference }),
    })
      .then(res => res.json())
      .then(data => {
        if (data.status === 'success') {
          navigate('/success');
        } else {
          navigate('/retry');
        }
      })
      .catch(() => {
         //navigate('/retry');
      });
  }, [reference, navigate]);

  return(
    <div className='bg-purple-50'>

      <div className="bg-white rounded-lg shadow-md "></div>
       
    </div>
  )
};

export default VerifyPayment;
