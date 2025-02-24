'use client';
import Image from 'next/image';
import Link from 'next/link';

const Header = () => {
  return (
    <header className="fixed top-0 left-0 right-0 z-50">
      <div className="absolute inset-0 bg-black/20 backdrop-blur-sm"></div>
      <div className="container mx-auto px-4 py-4 relative">
        <div className="flex items-center justify-between">
          <div className="w-20">
            <Image
              src="/images/svgLogos/__Logo_Icon_Colored.svg"
              alt="Limi Logo"
              width={100}
              height={40}
              priority
            />
          </div>
          
          <nav className="hidden md:flex items-center gap-12">
            <Link href="#products" className="text-white relative group">
              <span className="relative text-lg">
                Products
                <span className="absolute left-0 -bottom-1 w-0 h-[1px] bg-[#93cfa2] transition-all duration-300 group-hover:w-full"></span>
              </span>
            </Link>
            <Link href="#features" className="text-white relative group">
              <span className="relative text-lg">
                Features
                <span className="absolute left-0 -bottom-1 w-0 h-[1px] bg-[#93cfa2] transition-all duration-300 group-hover:w-full"></span>
              </span>
            </Link>
            <Link href="#about" className="text-white relative group">
              <span className="relative text-lg">
                About
                <span className="absolute left-0 -bottom-1 w-0 h-[1px] bg-[#93cfa2] transition-all duration-300 group-hover:w-full"></span>
              </span>
            </Link>
            <Link href="#contact" className="text-white relative group">
              <span className="relative text-lg">
                Contact
                <span className="absolute left-0 -bottom-1 w-0 h-[1px] bg-[#93cfa2] transition-all duration-300 group-hover:w-full"></span>
              </span>
            </Link>
          </nav>

          <button className="px-6 py-2 rounded-full border border-[#93cfa2] text-[#93cfa2] text-lg
            transition-all duration-300
            hover:bg-[#93cfa2]/10
            hover:border-[#93cfa2]
            hover:text-[#93cfa2]
            hover:shadow-[0_0_20px_rgba(147,207,162,0.3)]
            hover:scale-105
            active:scale-100
            focus:outline-none focus:ring-2 focus:ring-[#93cfa2] focus:ring-opacity-50">
            Contact Us
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
