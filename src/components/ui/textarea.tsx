
import * as React from "react"
import { useEffect, useRef } from "react"

import { cn } from "@/lib/utils"

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  autoResize?: boolean;
}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, autoResize, ...props }, ref) => {
    const textareaRef = useRef<HTMLTextAreaElement | null>(null);

    const handleResize = () => {
      if (autoResize && textareaRef.current) {
        // Reset height to auto so it can shrink when content is deleted
        textareaRef.current.style.height = 'auto';
        // Set the height to the scroll height
        textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
      }
    };

    useEffect(() => {
      // Set the ref to our ref
      if (typeof ref === 'function') {
        ref(textareaRef.current);
      } else if (ref) {
        ref.current = textareaRef.current;
      }
      
      if (autoResize && textareaRef.current) {
        // Initial resize
        handleResize();
        
        // Add input event listener
        textareaRef.current.addEventListener('input', handleResize);
        
        return () => {
          textareaRef.current?.removeEventListener('input', handleResize);
        };
      }
    }, [ref, autoResize]);

    return (
      <textarea
        className={cn(
          "flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-vertical",
          className
        )}
        ref={textareaRef}
        {...props}
      />
    )
  }
)
Textarea.displayName = "Textarea"

export { Textarea }
