import Image from "next/image";

const veterinarianImageUrl =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuBKha1lMzZywC492Nk8fw06NVPhpIigKyNAIHgoXu48UjRgwZqeLny07FCCyW7YXtBfnlLg4Hc88Jn7oUVeYE_o73PSKGaaVQi13IKFq5Ao-T_rXbZ-YwfGZSr0JLfyHMCItDxDj1IqbEOjF7_k1XNQtCAehAvsZc6k4SdkfU-Mi2MS_EuggeRFO5fTWAqytLXw_9zdlWQNlChyQvITMtB_BLhoTFverFvtdySOYBiLuif9DJylnr-ZXKZBk46uAXZaPO9dr-Mzrcs";

export default function AboutSection() {
  return (
    <section className="py-20">
      <div className="container mx-auto px-6">
        <div className="flex flex-col md:flex-row items-center gap-12">
          <div className="md:w-1/2">
            <Image
              src={veterinarianImageUrl}
              alt="A friendly veterinarian smiling with a dog"
              width={600}
              height={600}
              className="rounded-lg shadow-xl w-full h-auto object-cover"
              unoptimized
            />
          </div>
          <div className="md:w-1/2">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              About VetoDiag
            </h2>
            <p className="text-lg text-gray-400 mb-6">
              VetoDiag was founded by a team of veterinarians and pet lovers who
              believe that managing pet healthcare should be simple and
              stress-free. Our mission is to bridge the communication gap
              between clinics and pet owners through intuitive technology,
              ensuring the best possible care for our furry friends.
            </p>
            <p className="text-lg text-gray-400">
              We are dedicated to providing a reliable, secure, and
              user-friendly platform that empowers you to take an active role in
              your pet's health and well-being.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

