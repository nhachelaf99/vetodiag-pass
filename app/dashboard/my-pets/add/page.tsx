"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { usePets } from "@/contexts/PetsContext";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";

export default function AddPetPage() {
  const router = useRouter();
  const { addPet } = usePets();
  const { user } = useAuth();
  const [isUploading, setIsUploading] = useState(false);
  const [formData, setFormData] = useState({
    petName: "",
    species: "dog", // Default to a valid enum
    breed: "",
    age: "", // Keeping age string for now as it maps in context
    sex: "male", // Default
  });
  const [photoUrl, setPhotoUrl] = useState<string>("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    // Validation
    const newErrors: Record<string, string> = {};
    if (!formData.petName.trim()) {
      newErrors.petName = "Pet's name is required";
    }
    if (!formData.breed.trim()) {
      newErrors.breed = "Breed is required";
    }
    if (!formData.age.trim()) {
      newErrors.age = "Age is required";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsSubmitting(true);

    try {
      // Add pet to context
      const success = await addPet({
        name: formData.petName.trim(),
        species: formData.species,
        breed: formData.breed.trim(),
        age: formData.age.trim(),
        photoUrl: photoUrl || undefined,
        status: "Active",
        sex: formData.sex as "male" | "female",
      });

      if (success) {
          // Reset form
          setFormData({
            petName: "",
            species: "dog",
            breed: "",
            age: "",
            sex: "male",
          });
          setPhotoUrl("");
          setErrors({});

          // Redirect to patients page
          router.push("/dashboard/my-pets");
      } else {
          setErrors({ submit: "Failed to save pet to database. Please try again." });
      }
    } catch (error) {
      console.error("Error adding pet:", error);
      setErrors({ submit: "Failed to add pet. Please try again." });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    // Clear error for this field when user starts typing
    if (errors[e.target.name]) {
      setErrors({
        ...errors,
        [e.target.name]: "",
      });
    }
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) {
      return;
    }
    
    // Fallback logic for clinic ID
    let uploadClinicId = user?.clinicId;

    if (!uploadClinicId) {
       try {
           const { data: userData } = await supabase
            .from('users')
            .select('clinic_id')
            .eq('id', user?.clientId)
            .single();
           
           if (userData?.clinic_id) {
               uploadClinicId = userData.clinic_id;
           }
       } catch (err) {
           console.error("Failed to fetch clinic ID fallback:", err);
       }
    }

    if (!uploadClinicId) {
        console.error("User does not have a clinic ID. Cannot upload.");
        setErrors({ submit: "Cannot upload photo: Missing clinic authorization (ID not found)." });
        return;
    }

    const file = e.target.files[0];
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
    // Path: {clinic_id}/{random_name} to satisfy RLS: LIKE clinic_id || '/%'
    const filePath = `${uploadClinicId}/${fileName}`;

    setIsUploading(true);
    try {
        const { error: uploadError } = await supabase.storage
            .from('patients')
            .upload(filePath, file);

        if (uploadError) {
            throw uploadError;
        }

        const { data: { publicUrl } } = supabase.storage
            .from('patients')
            .getPublicUrl(filePath);

        setPhotoUrl(publicUrl);
    } catch (error: any) {
        console.error('Error uploading photo:', error);
        setErrors({ submit: `Failed to upload photo: ${error.message}` });
    } finally {
        setIsUploading(false);
    }
  };

  const handleCancel = () => {
    router.push("/dashboard/my-pets");
  };

  return (
    <>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8">
          <h1 className="text-4xl font-bold tracking-tight text-white">
            Add a New Pet
          </h1>
          <p className="mt-2 text-lg text-text-dark-secondary">
            Enter the details below to register a new member of your family.
          </p>
        </div>
        <div className="bg-surface-dark rounded-lg shadow-lg border border-border-dark">
          <form onSubmit={handleSubmit}>
            <div className="p-8 md:p-10 space-y-8">
              <div>
                <label
                  className="block text-sm font-medium text-white mb-2"
                  htmlFor="pet-photo"
                >
                  Pet's Photo
                </label>
                <div className="mt-1 flex items-center space-x-5">
                  <div className="relative">
                    {photoUrl ? (
                      <img 
                        src={photoUrl} 
                        alt="Pet preview" 
                        className="h-20 w-20 rounded-full object-cover"
                      />
                    ) : (
                      <span className="inline-block h-20 w-20 rounded-full overflow-hidden bg-white/10 flex items-center justify-center">
                        <svg
                          className="h-12 w-12 text-text-dark-secondary"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 48 48"
                        >
                          <path
                            d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                          />
                        </svg>
                      </span>
                    )}
                    {isUploading && (
                       <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center">
                         <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                       </div>
                    )}
                  </div>
                  <input
                    type="file"
                    id="photo-upload"
                    className="hidden"
                    accept="image/*"
                    onChange={handlePhotoUpload}
                    disabled={isUploading}
                  />
                  <button
                    type="button"
                    onClick={() => document.getElementById('photo-upload')?.click()}
                    className="bg-white/10 hover:bg-white/20 text-white font-semibold py-2 px-4 rounded-lg border border-border-dark transition-colors"
                    disabled={isUploading}
                  >
                    {isUploading ? 'Uploading...' : 'Upload Photo'}
                  </button>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Left Column */}
                <div>
                  <label
                    className="block text-sm font-medium text-white mb-2"
                    htmlFor="pet-name"
                  >
                    Pet's Name
                  </label>
                  <input
                    className={`block w-full bg-background-dark border ${
                      errors.petName ? "border-red-500" : "border-border-dark"
                    } rounded-lg shadow-sm placeholder-text-dark-secondary text-white focus:ring-primary focus:border-primary sm:text-sm px-4 py-3`}
                    id="pet-name"
                    name="petName"
                    type="text"
                    placeholder="e.g. Max"
                    value={formData.petName}
                    onChange={handleChange}
                  />
                  {errors.petName && (
                    <p className="mt-1 text-sm text-red-500">{errors.petName}</p>
                  )}
                </div>
                {/* Right Column */}
                <div>
                  <label
                    className="block text-sm font-medium text-white mb-2"
                    htmlFor="pet-species"
                  >
                    Species
                  </label>
                  <select
                    className={`block w-full bg-background-dark border ${
                      errors.species ? "border-red-500" : "border-border-dark"
                    } rounded-lg shadow-sm placeholder-text-dark-secondary text-white focus:ring-primary focus:border-primary sm:text-sm px-4 py-3`}
                    id="pet-species"
                    name="species"
                    value={formData.species}
                    onChange={handleChange}
                  >
                    <option value="dog">Dog</option>
                    <option value="cat">Cat</option>
                    <option value="bird">Bird</option>
                    <option value="reptile">Reptile</option>
                    <option value="rodent">Rodent</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                {/* Left Column - Second Row */}
                <div>
                  <label
                    className="block text-sm font-medium text-white mb-2"
                    htmlFor="pet-breed"
                  >
                    Breed
                  </label>
                  <input
                    className={`block w-full bg-background-dark border ${
                      errors.breed ? "border-red-500" : "border-border-dark"
                    } rounded-lg shadow-sm placeholder-text-dark-secondary text-white focus:ring-primary focus:border-primary sm:text-sm px-4 py-3`}
                    id="pet-breed"
                    name="breed"
                    type="text"
                    placeholder="e.g. Golden Retriever"
                    value={formData.breed}
                    onChange={handleChange}
                  />
                  {errors.breed && (
                    <p className="mt-1 text-sm text-red-500">{errors.breed}</p>
                  )}
                </div>
                {/* Right Column - Second Row */}
                <div>
                  <label
                    className="block text-sm font-medium text-white mb-2"
                    htmlFor="pet-age"
                  >
                    Age
                  </label>
                  <input
                    className={`block w-full bg-background-dark border ${
                      errors.age ? "border-red-500" : "border-border-dark"
                    } rounded-lg shadow-sm placeholder-text-dark-secondary text-white focus:ring-primary focus:border-primary sm:text-sm px-4 py-3`}
                    id="pet-age"
                    name="age"
                    type="text"
                    placeholder="e.g. 5 years"
                    value={formData.age}
                    onChange={handleChange}
                  />
                  {errors.age && (
                    <p className="mt-1 text-sm text-red-500">{errors.age}</p>
                  )}
                </div>
                 {/* Left Column - Third Row */}
                <div>
                  <label
                    className="block text-sm font-medium text-white mb-2"
                    htmlFor="pet-sex"
                  >
                    Sex
                  </label>
                  <select
                    className="block w-full bg-background-dark border border-border-dark rounded-lg shadow-sm placeholder-text-dark-secondary text-white focus:ring-primary focus:border-primary sm:text-sm px-4 py-3"
                    id="pet-sex"
                    name="sex"
                    value={formData.sex}
                    onChange={handleChange}
                  >
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                  </select>
                </div>
              </div>
            </div>
            <div className="px-8 py-5 bg-white/5 border-t border-border-dark flex justify-end space-x-3">
              {errors.submit && (
                <p className="text-sm text-red-500 mr-auto">{errors.submit}</p>
              )}
              <button
                type="button"
                onClick={handleCancel}
                className="px-5 py-2.5 text-sm font-semibold text-white bg-transparent rounded-lg hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary focus:ring-offset-surface-dark transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex items-center gap-2 px-5 py-2.5 bg-primary text-white text-sm font-semibold rounded-lg shadow-md hover:bg-green-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary focus:ring-offset-surface-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span className="material-icons text-base">add</span>
                {isSubmitting ? "Adding..." : "Add Pet"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}
