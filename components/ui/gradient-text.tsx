interface GradientTextProps {
  children: React.ReactNode;
  className?: string;
}

export function GradientText({ children, className = "" }: GradientTextProps) {
  return (
    <span className={`bg-gradient-to-r from-green-400 via-green-300 to-green-500 text-transparent bg-clip-text ${className}`}>
      {children}
    </span>
  );
}
