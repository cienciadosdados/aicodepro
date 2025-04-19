import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

interface AnimatedTextProps {
  text: string;
  className?: string;
  style?: React.CSSProperties;
  highlightWords?: string[];
}

export function AnimatedText({ text, className = "", style, highlightWords = [] }: AnimatedTextProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <span className={className}>{text}</span>;
  }

  const words = text.split(' ');
  
  return (
    <span className={className} style={style}>
      {words.map((word, i) => {
        const isHighlighted = highlightWords?.includes(word);
        return (
          <motion.span
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: i * 0.1 }}
            className="inline-block"
          >
            <span 
              style={isHighlighted ? { 
                color: '#0c83fe',
                fontWeight: 'inherit'
              } : undefined}
            >
              {word}
            </span>
            {i < words.length - 1 ? ' ' : ''}
          </motion.span>
        );
      })}
    </span>
  );
}
