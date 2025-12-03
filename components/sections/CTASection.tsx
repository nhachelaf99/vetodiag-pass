import Link from "next/link";

export default function CTASection() {
  return (
    <section className="pb-20">
      <div className="container mx-auto px-6">
        <div className="bg-card-dark rounded-b-2xl p-10 md:p-16 text-center border-x border-b border-gray-800/50 -mt-px">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Improve Your Veterinary Experience Today
          </h2>
          <p className="text-lg text-gray-400 mb-8 max-w-2xl mx-auto">
            Join hundreds of pet owners who trust VetoDiag to manage their pet's
            health. Sign up now and take control of your veterinary care.
          </p>
          <Link
            href="#"
            className="bg-primary text-white font-bold py-3 px-8 rounded-lg shadow-lg hover:bg-green-500 transition-all duration-300 transform hover:scale-105 inline-block"
          >
            Create Your Free Account
          </Link>
        </div>
      </div>
    </section>
  );
}

