interface GradientTextProps {
  children: React.ReactNode;
  className?: string;
}

export function GradientText({ children, className = "" }: GradientTextProps) {
  return (
    <span className={`bg-gradient-to-r from-purple-400 via-purple-300 to-purple-500 text-transparent bg-clip-text ${className}`}>
      {children}
    </span>
  );
}
