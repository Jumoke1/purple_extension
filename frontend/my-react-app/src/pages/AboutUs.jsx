import React from 'react';
import "react-responsive-carousel/lib/styles/carousel.min.css"; // Carousel styling
import { Carousel } from 'react-responsive-carousel'; // Carousel component
import { Link } from 'react-router-dom';


const About = () => {
  return (
    <div className="bg-white text-gray-800">
      {/* Hero Image */}
    <Carousel
      autoPlay
      infiniteLoop
      showThumbs={false}
      showStatus={false}
      interval={3000}
      transitionTime={800}
    >
      <div>
        <img src="/images/bouncy.png" alt="Ponytail Extension 1"  className="w-full h-[500px] object-contain bg-white rounded" />
      </div>
      <div>
        <img src="/images/braids.png" alt="Ponytail Extension 2"  className="w-full h-[500px] object-contain bg-white rounded" />
      </div>
      <div>
        <img src="/images/pony.png" alt="French Curl Extension 1"  className="w-full h-[500px] object-contain bg-white rounded" />
      </div>
      <div>
        <img src="/images/french.png" alt="French Curl Extension 2"  className="w-full h-[500px] bg-white object-contain rounded" />
      </div>
 </Carousel>


      {/* Main Content */}
      <div className="max-w-5xl mx-auto px-4 py-12">
        <h1 className="text-4xl font-bold text-purple-700 mb-4">About Purple Extension</h1>
        <p className="text-lg mb-6">
          At <strong>Purple Extension</strong>, we believe beauty starts with confidence and great hair is a big part of that.
          We're a proudly female led brand helping women own their style with effortless, elegant, and protective hair solutions.
        </p>

        <h2 className="text-2xl font-semibold mt-10 mb-3 text-gray-900">✨ What We Specialize In</h2>
        <ul className="list-disc pl-6 space-y-2 text-lg">
          <li><strong>Ponytail Extensions:</strong> Sleek, curly, or kinky, switch up your look in seconds with our easy to wear ponytails.</li>
          <li><strong>Braided Wigs:</strong> Flawless braided styles like box braids, twists, and cornrows without the salon hours.</li>
        </ul>

        <h2 className="text-2xl font-semibold mt-10 mb-3 text-gray-900">💎 Why Choose Purple Extension?</h2>
        <ul className="list-disc pl-6 space-y-2 text-lg">
          <li>Premium quality hair</li>
          <li>Lightweight, protective styles</li>
          <li>Perfect for everyday or events</li>
          <li>Fast delivery across Nigeria</li>
          <li>Excellent customer support</li>
        </ul>

        <h2 className="text-2xl font-semibold mt-10 mb-3 text-gray-900">👑 Our Mission</h2>
        <p className="text-lg mb-6">
          To empower women through versatile, protective, and stylish hair solutions that are easy to wear and even easier to love.
        </p>

        <h2 className="text-2xl font-semibold mt-10 mb-3 text-gray-900">💌 Join the Purple Family</h2>
        <p className="text-lg">
          Thousands of women trust Purple Extension to transform their look <Link to='/collections'  className="text-purple-700 underline hover:text-purple-900 font-semibold">Shop now </Link>Slay effortlessly. Stay Purple.
        </p>
      </div>
    </div>
  );
};

export default About;
