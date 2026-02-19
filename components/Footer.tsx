
import React from 'react';

interface FooterProps {
    t: (key: string) => string;
}

const Footer: React.FC<FooterProps> = ({ t }) => {
    const currentYear = new Date().getFullYear();
    return (
        <footer className="w-full text-center p-4 text-gray-500 text-xs">
            <p>&copy; {currentYear} Developed by ศูนย์ ไอซีที โรงเรียนสารคามพิทยาคม</p>
        </footer>
    );
};

export default Footer;
