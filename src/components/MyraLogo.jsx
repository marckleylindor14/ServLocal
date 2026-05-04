export default function MyraLogo({ className = "h-10 w-auto" }) {
    return (
      <svg
        viewBox="0 0 120 30"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={className}
      >
        {/* Icône maison stylisée (indigo profond) */}
        <path
          d="M8 16L4 12L0 16V28H16V16H8Z"
          fill="#1E2A3A"
        />
        {/* Toit (terracotta) */}
        <path
          d="M8 12L4 8L0 12H16L8 12Z"
          fill="#D97C5B"
        />
        {/* Cœur dans la maison */}
        <path
          d="M8 20C7 20 6 19 6 18C6 17 7 16 8 16C9 16 10 17 10 18C10 19 9 20 8 20Z"
          fill="none"
          stroke="#F5F3F0"
          strokeWidth="0.8"
        />
        {/* Typographie Myra */}
        <text
          x="22"
          y="22"
          fontFamily="Inter, sans-serif"
          fontWeight="800"
          fontSize="16"
          fill="#F5F3F0"
          letterSpacing="0.5"
        >
          Myra
        </text>
      </svg>
    );
  }