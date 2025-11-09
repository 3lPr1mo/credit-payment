import React, { useEffect } from "react";
import "./styles/Backdrop.css";

interface Props {
    open: boolean,
    onClose: () => void
    children: React.ReactNode
}

export default function Backdrop({ open, onClose, children }: Props) {

    useEffect(() => {
        if(open) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }

        return () => {
            document.body.style.overflow = '';
        }
    }, [open])

    if (!open) return null;

    const childrenWithProps = React.Children.map(children, (child) => {
        if (React.isValidElement(child)) {
            return React.cloneElement(child, { onClose } as any);
        }
        return child;
    });

    return (
        <div className="confirm-purchase-backdrop">
            <div className="backdrop-content" onClick={(e) => e.stopPropagation()}>
                {childrenWithProps}
            </div>
        </div>
    )
}