import { motion } from 'framer-motion';

interface TechHighlightProps {
  items: string[];
  className?: string;
}

export function TechHighlight({ items, className = "" }: TechHighlightProps) {
  return (
    <div className={`flex flex-wrap gap-2 ${className}`}>
      {items.map((item, index) => (
        <motion.span
          key={index}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
          className="inline-flex px-2 py-1 rounded-md bg-[#22c55e]/5 border border-[#22c55e]/10 text-[#22c55e]/90"
        >
          {item}
        </motion.span>
      ))}
    </div>
  );
}
