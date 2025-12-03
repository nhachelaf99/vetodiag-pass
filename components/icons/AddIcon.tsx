export default function AddIcon({ className }: { className?: string }) {
  return (
    <span className={`material-icons ${className || ""}`}>add</span>
  );
}

