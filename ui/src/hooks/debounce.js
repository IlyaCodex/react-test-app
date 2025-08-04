import { useEffect, useState } from "react"

export const useDebounce = (value, delay) => {
    const [val, setVal] = useState(value);

    useEffect(() => {
        const timeout = setTimeout(() => setVal(value), delay);
        return () => clearTimeout(timeout);
    }, [value, delay]);

    return val;
}