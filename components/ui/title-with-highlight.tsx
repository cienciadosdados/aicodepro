import { motion } from 'framer-motion';

interface TitleWithHighlightProps {
  className?: string;
}

export function TitleWithHighlight({ className = "" }: TitleWithHighlightProps) {
  return (
    <div className={`${className} flex flex-col items-center justify-center text-center`}>
      <h1 className="text-4xl font-bold tracking-tight text-white sm:text-6xl">
        <motion.span
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="inline-block bg-gradient-to-r from-[#0c83fe] via-[#4ade80] to-[#0c83fe] bg-clip-text text-transparent"
        >
          AI Code Pro:
        </motion.span>
      </h1>
      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="mt-6 text-lg leading-8 text-gray-300"
      >
        IA de Verdade. Para Quem Já Programa.
      </motion.p>
    </div>
  );
}
