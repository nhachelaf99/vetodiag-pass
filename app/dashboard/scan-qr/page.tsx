"use client";

import { useRouter } from "next/navigation";

export default function ScanQRPage() {
  const router = useRouter();

  const handleCancel = () => {
    router.push("/dashboard");
  };

  return (
    <div className="font-inter">
      <div className="w-full max-w-2xl mx-auto text-center">
        <h2 className="text-3xl font-bold text-white mb-2">Scan QR Code</h2>
        <p className="text-gray-400 mb-8">
          Point your device's camera at the QR code to connect instantly.
        </p>
        <div className="relative w-full aspect-square max-w-md mx-auto bg-card-dark rounded-lg border border-border-dark flex items-center justify-center overflow-hidden">
          {/* Dark background with camera icon */}
          <div className="absolute inset-0 bg-gray-900 flex items-center justify-center">
            <span className="material-symbols-outlined text-gray-600 text-9xl">
              photo_camera
            </span>
          </div>

          {/* Animated scanning line */}
          <div className="absolute left-0 right-0 h-1 bg-primary scan-animation" />

          {/* Corner brackets - Top Left */}
          <div className="absolute top-4 left-4 w-12 h-12 border-t-4 border-l-4 border-primary rounded-tl-lg" />

          {/* Corner brackets - Top Right */}
          <div className="absolute top-4 right-4 w-12 h-12 border-t-4 border-r-4 border-primary rounded-tr-lg" />

          {/* Corner brackets - Bottom Left */}
          <div className="absolute bottom-4 left-4 w-12 h-12 border-b-4 border-l-4 border-primary rounded-bl-lg" />

          {/* Corner brackets - Bottom Right */}
          <div className="absolute bottom-4 right-4 w-12 h-12 border-b-4 border-r-4 border-primary rounded-br-lg" />
        </div>

        <div className="mt-8 flex flex-col items-center">
          <div className="flex items-center text-gray-300">
            <span className="material-symbols-outlined mr-2 text-primary">
              center_focus_strong
            </span>
            <p>Align the QR code within the frame.</p>
          </div>
          <div className="mt-10">
            <button
              onClick={handleCancel}
              className="bg-gray-700 hover:bg-gray-600 text-white font-semibold py-3 px-8 rounded-lg transition-colors"
            >
              Cancel Scan
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

