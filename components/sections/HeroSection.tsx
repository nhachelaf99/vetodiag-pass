import Link from "next/link";

export default function HeroSection() {
  return (
    <section className="py-24 md:py-36">
      <div className="container mx-auto px-6 text-center">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 leading-tight">
            The All-In-One Software for{" "}
            <span className="text-primary text-glow">Better Veterinary Care</span>
          </h1>
          <p className="text-lg md:text-xl text-gray-400 mb-10">
            Advanced veterinary software for streamlined operations and improved
            care for your beloved pets. Access records, book appointments, and
            connect with your vet seamlessly.
          </p>
          <div className="flex justify-center space-x-4">
            <Link
              href="#"
              className="bg-primary text-white font-bold py-3 px-8 rounded-lg shadow-lg hover:bg-green-500 transition-all duration-300 transform hover:scale-105"
            >
              Get Started
            </Link>
            <Link
              href="#"
              className="bg-card-dark text-gray-200 font-bold py-3 px-8 rounded-lg hover:bg-gray-800/50 transition-colors border border-gray-800"
            >
              Learn More
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

