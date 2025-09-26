
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';

const  AddnewProduct = () => {

    const [error, setError] = useState(null)
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
      product_name: '', 
      product_price: '',           
      product_description: '',      
      color: [],               
      length: [],                  
      stock: '',                    
      status: '', 
      best_seller:false,
      new_in_stock:false,            
      category: '',
    })
    const [imageFile, setImageFile] = useState(null)
    const navigate = useNavigate()

    const handleChange = (e) => {
        const {name, value } = e.target;
        let newValue = value;

        if (name === "color" || name === "length") {
            newValue = value.split(",").map((item) => item.trim());
        }

        if (name === "best_seller"|| name=== "new_in_stock") {
            newValue = value === "true"
        }

        setFormData(prevData => ({
            ...prevData,
            [name]: newValue
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        setLoading(true)
        setError(null)
        
        //client side verification
        const requiredFields =['product_name', 'product_price', 'product_description', 'stock', 'length', 'status', 'new_in_stock','best_seller','category'
        ]
        const missingFields = requiredFields.filter(field => 
        formData[field] === '' || formData[field] === null || formData[field] === undefined
        );


        if (missingFields.length > 0) {
          alert(`Missing required fields: ${missingFields.join(', ')}`);
          setLoading(false)
          return
        }

        if (!imageFile) {
        setError('Please upload a product image');
        setLoading(false);
        return;
    }


    const formDataToSend = new FormData();
    Object.entries(formData).forEach(([key, value]) => {

    if (Array.isArray(value)) {
         value.forEach(item => formDataToSend.append(key, item));
    }

        else if (value !== '') {
                formDataToSend.append(key, value);
            }
        })
        formDataToSend.append('image', imageFile)
    
    
        try{

              //Get token from localStorage
            const token = localStorage.getItem('token');

            const response = await fetch('http://localhost:5002/add_product',{
                method: 'POST',
                headers:{
                    "Authorization": `Bearer ${token}`
                },
                body: formDataToSend
            });
             const result = await response.json()
             if (!response.ok) {
                throw new Error(result.error || `Server error: ${response.status}`);
             }
                
        
            alert('Product added successfully!');
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
                    ADD NEW PRODUCT
                </div>
                <nav className='text-sm space-x-1'>
                    <Link className='text-purple-400 hover:underline'>Dashboard  </Link>
                    <span className='text-purple-500'>/</span>
                    <Link to='/productmanagement' className='text-purple-400 hover:underline'>Products</Link>    
                </nav> 

            </section>

            <section className='bg-purple-100 min-h-screen flex items-center justify-center p-4'>

            {error && <p className="text-red-500 mb-4">{error}</p>}

            <div className=' w-full bg-white rounded-lg shadow p-6 max-w-2xl'>
                
                <form onSubmit={handleSubmit} action=""className=''>
                    <h3 className="text-purple-400 font-semibold text-lg mb-4">Basic Information</h3>
                        
                    <div>
                    <input type="text"
                     name="product_name"
                    value={formData.product_name}
                    onChange={handleChange}
                    className='px-3 py-3 border border-purple-200 w-full rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-purple-400' placeholder=''/>
                    <br />
                    <label htmlFor="" className='block text-sm font-medium text-gray-700 mb-2'>Product Name</label>
                    </div>


                     <div className='mt-6'>
                    <input type="number" 
                     name="product_price"
                     value={formData.product_price}
                     onChange={handleChange}
                     className=' px-3 py-3 border border-purple-200 w-full rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-purple-400' placeholder=''/>
                    <br />
                    <label htmlFor="" className='block text-sm font-medium text-gray-700 mb-2'>Product Price</label>
                    </div>

                  
                    <div className='mt-6'>
                    <textarea
                        name="product_description"
                        value={formData.product_description}
                        onChange={handleChange}
                        rows={3} // optional: controls the height
                        className='px-5 py-3 border w-full border-purple-200 rounded-lg resize-y focus:outline-none focus:ring-2 focus:ring-purple-400'
                        ></textarea>
                        <label htmlFor="" className='block text-sm font-medium text-gray-700 mb-2'>Product Description</label>
                    </div>

                    
                    <div className='mt-6'>
                    <input type="text"
                     name="color" 
                     value={formData.color.join(',')}
                     onChange={handleChange}
                     className='px-3 py-3 border border-purple-200 w-full rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-purple-400' placeholder=''/>
                    <br />
                    <label htmlFor="" className='block text-sm font-medium text-gray-700 mb-2'>Colors</label>
                    </div>
                    
                     <div className='mb-4'>
                    <input type="text"
                     name="length"
                     value={formData.length.join(',')}
                     onChange={handleChange}
                     

                    className='px-3 py-3 border border-purple-200 w-full rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-purple-400' placeholder=''/>
                    <br />
                    <label htmlFor="" className='block text-sm font-medium text-gray-700 mb-2'>length</label>
                    </div>
                    
                    <div className="mb-4">
                          
                            <select
                                name="status"
                                value={formData.status}
                                onChange={handleChange}
                                className='border border-purple-200 rounded-lg px-2 py-4 w-full'
                                required
                            >
                                <option value="active">Active</option>
                                <option value="inactive">Inactive</option>
                            </select>
                              <label className='block text-sm font-medium text-gray-700 mb-1'>
                                Status
                            </label>
                        </div>


                      <div className="mb-4">
                          
                            <select
                                name="new_in_stock"
                                value={formData.new_in_stock}
                                onChange={handleChange}
                                className='border border-purple-200 rounded-lg px-2 py-4 w-full'
                                required
                            >
                                <option value="true">True</option>
                                <option value="false">False</option>
                            </select>
                              <label className='block text-sm font-medium text-gray-700 mb-1'>
                                 New in Stock
                            </label>
                        </div>

                        <div className="mb-4">
                          
                            <select
                                name="best_seller"
                                value={formData.best_seller}
                                onChange={handleChange}
                                className='border border-purple-200 rounded-lg px-2 py-4 w-full'
                                required
                            >
                                <option value="true">True</option>
                                <option value="false">False</option>
                            </select>
                              <label className='block text-sm font-medium text-gray-700 mb-1'>
                                 Best seller
                            </label>
                        </div>
                    
                    
                    <div>
                    <input type="number"
                    name='stock'
                    value={formData.stock}
                     onChange={handleChange}
                    className='px-3 py-3 border border-purple-200 w-full rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-purple-400' placeholder=''/>
                    <br />
                    <label htmlFor="" className='block text-sm font-medium text-gray-700 mb-2'>No in Stock</label>
                    </div>
                    
                    <div>
                    <div className='border border-purple-200 rounded-lg px-3 py-9 mt-6 w-full'>
                    <select
                     name='category'
                     value={formData.category}
                     onChange={handleChange}
                      id="">
                        <option value="ponytail">Ponytail</option>
                        <option value="braidedwig">Braided Wig</option>
                         <option value="frenchcurlsextension">French curls extension</option>
                    </select>
                    </div>
                     <label htmlFor="" className='block text-sm text-gray-700 font-medium mb-2'>Category</label>
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
                    name='image'
                    type="file"
                    accept="image/*"
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    onChange={(e) => setImageFile(e.target.files[0])}
                    />
                </div>

                    <label className="block text-sm font-medium text-gray-700 mb-2">
                    Product Images
                    </label>

                {/* 👇 preview image */}
                {imageFile && (
                    <div className="mt-4">
                    <p className="text-sm text-gray-600">Image Preview:</p>
                    <img
                        src={URL.createObjectURL(imageFile)}
                        alt="Preview"
                        className="w-40 h-40 object-cover rounded border border-gray-300 mt-2"
                    />
                    </div>
                )}
                </div>


                <div className="flex gap-x-4">
                        <button type='submit'
                         disabled={loading}
                         className='border border-purple-700 bg-purple-700 rounded-lg px-7 py-2.5 text-white font-semibold shadow-md mt-6 hover:bg-purple-800 disabled:opacity-50'>
                          {loading ? 'Saving...' : 'Save Product'}
                        </button>

                        <button type='button'
                        onClick={()=> navigate('/productmanagement')}
                         className='border border-purple-200 bg-white rounded-lg px-7 py-2.5 text-purple-400 font-semibold shadow-md mt-6 hover:bg-gray-50'>
                         Cancel
                        </button>
                 </div>


                </form>
         
                </div>
            </section>

        </div>

    )
}
export default AddnewProduct;