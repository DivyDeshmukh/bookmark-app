import { forwardRef } from "react";

type InputProps = React.InputHTMLAttributes<HTMLInputElement>;

const Input = forwardRef<HTMLInputElement, InputProps>(
      ({ className = "", ...props }, ref) => {
        return (
            <input 
                ref={ref}
                className={`w-full rounded-xl border border-gray-200 px-3 py-2.5 focus:border-blue-400 focus:outline-none bg-white text-black ${className}`}
                {...props}
            />
        )
      }
);

Input.displayName = "Input";

export default Input;
