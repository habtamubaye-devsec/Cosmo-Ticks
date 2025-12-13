import { FaFacebook, FaGithub, FaInstagram } from "react-icons/fa"

function Footer() {
  return (
    <div className=" bg-gray-100 px-[10%] mt-10">
        {/* Upper */}
        <div className="flex flex-wrap gap-5 justify-between py-10">
          <div>
            <img src="/project_images/blisslogo1.png" alt="" width={200}/>
            <p className="mt-2">LET'S MAKE YOUR SKIN FLOURISH WITH OUR PRODUCT</p>
          </div>

          <div className="">
            <h3 className="text-xl font-semibold">Quick Links</h3>
            <ul className="mt-2">
              <li><a href="" className="text-gray-700 hover:text-black">Home</a></li>
              <li><a href="" className="text-gray-700 hover:text-black">About us</a></li>
              <li><a href="" className="text-gray-700 hover:text-black">Shop</a></li>
              <li><a href="" className="text-gray-700 hover:text-black">Contsct</a></li>
            </ul>
          </div>

          <div className="w-full md:w-1/3">
            <h2 className="text-xl font-semibold">Contact us</h2>
            <div className="mt-2 text-gray-700">
              <p>123 BeautyBliss Ave, City Country</p>
              <p>Phone:(123) 4235-54225</p>
              <p>Email: info@beautybliss.com</p>
            </div>
          </div>
          
        </div>

        {/* Lower */}
        <div className="py-12 border-t border-t-gray-400 text-center text-gray-700">
          <p>&copy ; 2024 BeautyBLiss. All rights reserved</p>
          <div className="flex justify-center gap-5 text-2xl mt-2">
            <FaInstagram />
            <FaGithub />
            <FaFacebook />  
          </div>
        </div>
    </div>
  )
}

export default Footer