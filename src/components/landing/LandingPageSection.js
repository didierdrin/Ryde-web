import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

const LandingPageSection = ({ title, children }) => (
    <div className="pt-24 pb-16 bg-white min-h-[calc(100vh-60px)]">
        <div className="max-w-3xl mx-auto px-6">
            <Link
                to="/"
                className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 no-underline mb-8"
            >
                <ArrowLeft size={16} />
                Back to home
            </Link>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">{title}</h1>
            <p className="text-sm text-gray-500 mb-10">Last updated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>
            <div className="prose prose-gray max-w-none text-gray-700 space-y-6">
                {children}
            </div>
        </div>
    </div>
);

export default LandingPageSection;
