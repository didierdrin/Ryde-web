import React, { useState } from 'react';
import LandingPageSection from '../../components/landing/LandingPageSection';
import { Mail, MapPin, Phone } from 'lucide-react';

const ContactUs = () => {
    const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
    const [submitted, setSubmitted] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        setSubmitted(true);
    };

    return (
        <LandingPageSection title="Contact Us">
            <p>
                Have a question about RYDE, your account, or a recent trip? Send us a message and our support team
                will get back to you as soon as possible.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 not-prose my-8">
                <div className="border border-gray-200 rounded-lg p-4">
                    <Mail size={20} className="text-gray-700 mb-2" />
                    <p className="text-sm font-semibold text-gray-900">Email</p>
                    <p className="text-sm text-gray-600">support@ryde.rw</p>
                </div>
                <div className="border border-gray-200 rounded-lg p-4">
                    <Phone size={20} className="text-gray-700 mb-2" />
                    <p className="text-sm font-semibold text-gray-900">Phone</p>
                    <p className="text-sm text-gray-600">+250 788 000 000</p>
                </div>
                <div className="border border-gray-200 rounded-lg p-4">
                    <MapPin size={20} className="text-gray-700 mb-2" />
                    <p className="text-sm font-semibold text-gray-900">Office</p>
                    <p className="text-sm text-gray-600">Kigali, Rwanda</p>
                </div>
            </div>

            {submitted ? (
                <div className="border-2 border-black rounded-lg p-6 text-center not-prose">
                    <p className="font-semibold text-gray-900">Thank you for reaching out.</p>
                    <p className="text-sm text-gray-600 mt-2">We have received your message and will respond shortly.</p>
                </div>
            ) : (
                <form onSubmit={handleSubmit} className="not-prose space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="contact-name" className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                            <input
                                id="contact-name"
                                name="name"
                                type="text"
                                required
                                value={form.name}
                                onChange={handleChange}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm outline-none focus:border-black focus:ring-4 focus:ring-black/10"
                            />
                        </div>
                        <div>
                            <label htmlFor="contact-email" className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                            <input
                                id="contact-email"
                                name="email"
                                type="email"
                                required
                                value={form.email}
                                onChange={handleChange}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm outline-none focus:border-black focus:ring-4 focus:ring-black/10"
                            />
                        </div>
                    </div>
                    <div>
                        <label htmlFor="contact-subject" className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
                        <input
                            id="contact-subject"
                            name="subject"
                            type="text"
                            required
                            value={form.subject}
                            onChange={handleChange}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm outline-none focus:border-black focus:ring-4 focus:ring-black/10"
                        />
                    </div>
                    <div>
                        <label htmlFor="contact-message" className="block text-sm font-medium text-gray-700 mb-1">Message</label>
                        <textarea
                            id="contact-message"
                            name="message"
                            rows={5}
                            required
                            value={form.message}
                            onChange={handleChange}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm outline-none focus:border-black focus:ring-4 focus:ring-black/10 resize-y"
                        />
                    </div>
                    <button type="submit" className="px-6 py-3 btn-outline-primary rounded-lg">
                        Send message
                    </button>
                </form>
            )}
        </LandingPageSection>
    );
};

export default ContactUs;
