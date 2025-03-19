import React from "react";

export const Spinner: React.FC<{ size?: number }> = ({ size = 24 }) => {
    return (
        <div
            className={`animate-spin rounded-full border-2 border-gray-300 border-t-black`}
            style={{ width: size, height: size }}
        />
    );
};