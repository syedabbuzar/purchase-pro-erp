export function Logo({
  className = "",
  showText = true,
  variant = "dark",
}: {
  className?: string;
  showText?: boolean;
  variant?: "dark" | "light";
}) {
  const isLight = variant === "light";

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      {/* Logo Image */}
      <img
        src="/realpng.png" // <-- Apna logo path yahan do
        alt="Logo"
        className="h-20 w-auto"
      />

      {showText && (
        <div className="flex flex-col leading-none">
          <span
            className={`font-display text-3xl font-semibold tracking-tight ${
              isLight ? "text-cream" : "text-white"
            }`}
          >
            MellowMoon
          </span>

          <span
            className={`text-[10px] font-medium  tracking-[0.18em] ${
              isLight ? "text-cream/70" : "text-gray-300"
            }`}
          >
            SoftTech Pvt Ltd
          </span>
        </div>
      )}
    </div>
  );
}