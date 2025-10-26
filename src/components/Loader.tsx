import { motion, AnimatePresence } from "framer-motion";

interface LoaderProps {
  loading: boolean;
  size?: number;
  color?: string;
  className?: string;
}

export default function Loader({
  loading,
  size = 32,
  color = "text-green-500",
  className = ""
}: LoaderProps) {
  return (
    <AnimatePresence>
      {loading && (
        <motion.div
          key="spinner"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className={`flex justify-center items-center ${className}`}
        >
          <svg
            className={`animate-spin ${color}`}
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            style={{ width: size, height: size }}
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
            ></path>
          </svg>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
