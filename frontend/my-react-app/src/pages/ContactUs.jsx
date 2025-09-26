import { useState } from 'react';
import React from 'react';
import { FaEnvelope, FaPhone, FaInstagram, FaFacebookF, FaMapMarkerAlt, FaTiktok} from 'react-icons/fa';


const ContactUs = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('') ;
  const [message, setMessage] = useState('')
  const [subject, setSubject] = useState('')


  const handleSubmit = async (e) => {
    e.preventDefault();

    const complaintData = {
    name ,
    email,
    message,
    subject
  }

  // validation
  if (!name || !email || !message || !subject) {
  alert("Please fill in all required fields.");
  return;
}
    try{
      const res = await fetch("http://localhost:5002/submit_complain",{
        method: 'POST',
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(complaintData),
      })

      if (!res.ok) {
        throw new Error("Failed to submit complaint");
      }

      const data = await res.json();
      console.log("Complaint submitted:", data);

      setName('');
      setEmail('');
      setMessage('');
      setSubject('');
      
      alert("Complaint submitted successfully!");
     }catch(error) {
      console.error(error);
      alert("Something went wrong while submitting your complaint.");
     }
};


    return(
        <div>
        <section className="h-44 w-full bg-cover bg-center bg-no-repeat"> 

          <div className="bg-purple-50 text-gray-800 px-6 py-12 text-center">
        <h2 className="text-3xl md:text-4xl font-bold mb-4 text-purple-900">
          Get in Touch
         </h2>
        <p className="text-base md:text-lg max-w-xl mx-auto">
        Have questions, need a custom order, or looking for styling advice? 
            </p>
      </div>

         
      </section>
      <section className='max-w-6xl mx-auto px-4 py-12'>
        <div className="flex flex-col md:flex-row gap-8">
            {/* contact form */}
           <div className="bg-purple-50 rounded-lg shadow p-6 flex-1 ">
            <h2 className="text-xl font-semibold mb-4 text-purple-700">Get in touch</h2>
            <form onSubmit={handleSubmit}  className="space-y-4">
                <div>
                    <label className="block text-sm mb-1">Name</label>
                    <input type="text" 
                     value={name}
                     onChange={(e) => setName(e.target.value)}
                     className='"w-full border rounded px-3 py-2' placeholder= "Your Name"/>
                </div>
                <div>
                    <label className="block text-sm mb-1">Email</label>
                    <input type="text" 
                     value={email}
                     onChange={(e) => setEmail(e.target.value)}
                    className='w-full border rounded px-3 py-2' placeholder= "Your Email"/>
                </div>
                <div>
                    <label className="block text-sm mb-1">Subject</label>
                    <select
                       value={subject}
                       onChange={(e) => setSubject(e.target.value)}
                       >
                        <option value="Order">Order</option>
                        <option value="Delivery Inquiry">Delivery Inquiry</option>
                        <option value="Styling Advice">Styling Advice</option>
                        <option value="Others">Others</option>
                     </select>
                </div>
                <div>
                    <label className="block text-sm mb-1">Message</label>
                    <textarea 
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      className="w-ful border rounded px-3 py-2" rows={4} id=""></textarea>
                </div>

                <button type='submit' className='w-full text-white rounded bg-purple-700 px-4 py-2 hover:bg-purple-500 '>
                    Send Message 
                </button>
            </form>
            </div> 

            {/* right contact details */}
            <div className="bg-purple-50 rounded-lg shawdow p-6 flex-1">
                <h3 className='text-purple-700 mb-4 font-semibold text-xl'>Contact Details</h3>

                <div className="space-y-4 text-sm">
                  <div className='flex items-center'>
                    <FaEnvelope className="mr-2 text-purple-700"/>
                    <span>Email</span>
                  </div>
                     <p className="ml-6 text-gray-700">purpleextension@gmail.com</p>


                   <div className="flex item-center">
                    <FaPhone className="mr-2 text-purple-700"/>
                    <span>Phone</span>
                    </div>
                    <p className='ml-6 text-gray-700'>+2348023456789</p>
              
                   <div className="flex item-center">
                    <FaMapMarkerAlt className="mr-2 text-purple-700"/>
                    <span>Location</span>
                    </div>
                    <p className='ml-6 text-gray-700'>123 Luxe-lekki,Lagos</p>
                </div>
             
              <h2 className='text-xl font-semibold mt-6 mb-4'>Connect With Us</h2>
                <div className="flex space-x-4">
                    <a href="#" className="text-purple-700 hover:text-purple-600">
                        <FaInstagram size={24}/>
                   </a>
                   <a href="#" className="text-purple-700 hover:text-purple-600">
                        <FaFacebookF size={24}/>
                   </a>

                   <a href="#" className="text-purple-700 hover:text-purple-600">
                        <FaTiktok size={24}/>
                   </a>
                </div>
  
        </div>
        </div>
      </section>

      </div>
    )
}
export default ContactUs;