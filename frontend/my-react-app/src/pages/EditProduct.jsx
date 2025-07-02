import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useParams } from 'react-router-dom';

const EditProduct = () =>{
    const [error, setError]= useState();
    const {id} = useParams()
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
    product_name: '',
    product_price: '',
    product_description: '',
    color: '',
    length: '',
    stock: '',
    category: '',
  })
  const[imageFile, setImageFile] = useState(null)
  const [loading, setLoading] = useState(false)


  useEffect(() => {
    fetch(`http://localhost:5002/products/${id}`) 
    .then((response) => {
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      return response.json();
    })
    .then((data) => {
      setFormData({
      product_name: data.product_name || '',
      product_price: data.product_price || '',
      product_description: data.product_description || '',
      color: data.color || '',
      length: data.length || '',
      stock: data.stock || '',
      category: data.category || '',
    
    })
      setImageFile(data.image_url || null)
  })
    .catch((err) => {
      console.error("fetch error:", err);
      setError(err.message);
    });
}, [id]);

    const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

    const handleImageChange = (e) => {
    const file = e.target.files[0];
    setImageFile(file);
    };

     const handleSubmit = async (e) => {
        e.preventDefault();

        setLoading(true)
        setError(null)

     const formDataToSend = new FormData();
     Object.entries(formData).forEach(([key, value]) => {
        if (value !== ''){
            formDataToSend.append(key, value);
            }
        })
        if (imageFile) {
      formDataToSend.append('image_url', imageFile);
    }

    
        try{
            const response = await fetch(`http://localhost:5002/update_product/${id}`,{
                method: 'PATCH',
                body: formDataToSend,
                mode: 'cors',
                headers: { 'Origin': 'http://localhost:5173' }
            });
             const result = await response.json()
             if (!response.ok) {
                throw new Error(result.error || `Server error: ${response.status}`);
             }
                
        
            alert('Product updated successfully!');
             // Optionally redirect or reset form:
             navigate('/productmanagement');
            } catch (error) {
              console.error('Error adding product:', error);
              setError(error.message);
            }finally{
                setLoading(false)
            }
     }
    return(
        <div>
            <section className=" flex justify-between items-center bg-white w-full p-4">
                <div className="flex text-xl font-semibold text-gray-800">
                    EDIT PRODUCT
                </div>
                <nav className='text-sm space-x-1'>
                <Link className='text-purple-400 hover:underline'>Dashboard  </Link>
                <span className='text-purple-500'>/</span>
                <Link to='/productmanagement' className='text-purple-400 hover:underline'>Products</Link>    
                </nav> 
            
            </section>
            
              <section className='bg-purple-100 min-h-screen flex items-center justify-center p-4'>

            <div className=' w-full bg-white rounded-lg shadow p-6 max-w-2xl'>
                
                <form onSubmit={handleSubmit} className=''>
                    <h3 className="text-purple-400 font-semibold text-lg mb-4">Basic Information</h3>

                    <div>
                    <input type="text"
                     name="product_name"
                     value={formData.product_name}
                     onChange={handleInputChange}
                     className='px-3 py-3 border border-purple-200 w-full rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-purple-400' placeholder=''/>
                    <br />
                    <label htmlFor="" className='block text-sm font-medium text-gray-700 mb-2'>Product name</label>
                    </div>


                    <div className='mt-6'>
                     <input type="text" 
                     value={formData.product_price}
                     name="product_price"
                     onChange={handleInputChange}
                     className=' px-3 py-3 border border-purple-200 w-full rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-purple-400' placeholder=''/>
                    <br />
                    <label htmlFor="" className='block text-sm font-medium text-gray-700 mb-2'>Product price</label>
                    </div>

                    <div className='mt-6'> 
                        <input type="text"
                        value={formData.product_description}
                         name="product_description"
                         onChange={handleInputChange}
                        className='px-5 py-9 border w-full border-purple-200 rounded-lg' />
                        <br />
                        <label htmlFor="" className='block text-sm font-medium text-gray-700 mb-2'>Description</label>
                    </div>

                    
                     <div>
                    <input type="text"
                     value={formData.color}
                      name='color'
                      onChange={handleInputChange}
                     className='px-3 py-3 border border-purple-200 w-full rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-purple-400' placeholder=''/>
                    <br/>
                    <label htmlFor="" className='block text-sm font-medium text-gray-700 mb-2'>Colors</label>
                    </div>
                    
                     <div>
                    <input type="text"
                     value={formData.length}
                     name='length'
                     onChange={handleInputChange}
                    className='px-3 py-3 border border-purple-200 w-full rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-purple-400' placeholder=''/>
                    <br />
                    <label htmlFor="" className='block text-sm font-medium text-gray-700 mb-2'>length</label>
                    </div>
                    
                 
                    
                    
                     <div>
                    <input type="text"
                     value={formData.stock}
                     name='stock'
                     onChange={handleInputChange}
                    className='px-3 py-3 border border-purple-200 w-full rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-purple-400' placeholder=''/>
                    <br />
                    <label htmlFor="" className='block text-sm font-medium text-gray-700 mb-2'>Stock</label>
                    </div>
                    
                
                    
                    <div className="mt-6">
                      
                        <div
                            className="relative flex flex-col items-center justify-center border-2 border-dashed border-purple-200 rounded-lg p-6 cursor-pointer hover:border-purple-400 transition">
                            <svg
                            className="w-12 h-12 text-purple-300 mb-3"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                            >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M7 16V4m10 12V4m-5 16h5m-5 0H7"
                            />
                            </svg>
                            <p className="text-sm text-gray-500">
                            Click to upload or drag and drop
                            </p>
                            <input
                            type="file"
                            multiple
                            accept="image/*"
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                            onChange={handleImageChange}
                            />
                        </div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                            Product Images
                        </label>
                        </div>

                <div className="flex gap-x-4">
                 <button type='submit' className='border border-purple-700 bg-purple-700 rounded-lg px-7 py-2.5 text-white font-semibold shadow-md mt-6'>
                    Save Product
                </button>

                <button type='button' className='border border-purple-200 bg-white rounded-lg px-7 py-2.5 text-purple-400 font-semibold shadow-md mt-6 '>
                    Cancel
                </button>
                 </div>


                </form>
             
                </div>




            </section>


        </div>
    )
}

export default EditProduct;