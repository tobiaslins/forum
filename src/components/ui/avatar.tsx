import Image from "next/image";

interface AvatarProps {
  src: string;
  alt: string;
  size?: "sm" | "md";
  status?: "online" | "offline";
}

export function Avatar({ src, alt, size = "md", status }: AvatarProps) {
  return (
    <div className="relative">
      <div
        className={`
        relative inline-block rounded-full overflow-hidden bg-gray-200
        ${size === "sm" ? "h-8 w-8" : "h-10 w-10"}
      `}
      >
        <Image
          src={src || "/placeholder.svg"}
          alt={alt}
          fill
          className="object-cover"
        />
      </div>
      {status && (
        <span
          className={`
          absolute top-0 right-0 block h-2.5 w-2.5 rounded-full ring-2 ring-white
          ${status === "online" ? "bg-green-400" : "bg-gray-300"}
        `}
        />
      )}
    </div>
  );
}
