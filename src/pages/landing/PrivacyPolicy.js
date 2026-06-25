import React from 'react';
import { Link } from 'react-router-dom';
import LandingPageSection from '../../components/landing/LandingPageSection';

const PrivacyPolicy = () => (
    <LandingPageSection title="Privacy Policy">
        <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">1. Introduction</h2>
            <p>
                RYDE (&quot;we&quot;, &quot;our&quot;, or &quot;us&quot;) respects your privacy and is committed to protecting
                the personal information you share when using our mobile application, web platform, and related services.
                This Privacy Policy explains what data we collect, how we use it, and the choices you have.
            </p>
        </section>

        <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">2. Information we collect</h2>
            <ul className="list-disc pl-5 space-y-2">
                <li>Account details such as your name, email address, and phone number.</li>
                <li>Profile information including payment preferences and emergency contacts.</li>
                <li>Trip and booking data, including pickup and destination locations.</li>
                <li>Device and usage information needed to operate and improve the service.</li>
                <li>Location data when you request rides or use map-based features.</li>
            </ul>
        </section>

        <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">3. How we use your information</h2>
            <p>We use your information to:</p>
            <ul className="list-disc pl-5 space-y-2 mt-2">
                <li>Provide, maintain, and improve ride booking, rentals, auctions, and payment services.</li>
                <li>Connect passengers with drivers and process transactions securely.</li>
                <li>Send service-related notifications and respond to support requests.</li>
                <li>Protect the safety and security of our users and platform.</li>
                <li>Comply with legal obligations and enforce our terms.</li>
            </ul>
        </section>

        <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">4. Sharing of information</h2>
            <p>
                We may share limited information with drivers, payment processors, and service providers who help us
                operate RYDE. We do not sell your personal information. Data may also be disclosed when required by law
                or to protect the rights and safety of RYDE users.
            </p>
        </section>

        <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">5. Data retention and security</h2>
            <p>
                We retain personal data only as long as necessary to provide our services and meet legal requirements.
                We apply reasonable technical and organizational measures to safeguard your information against
                unauthorized access, loss, or misuse.
            </p>
        </section>

        <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">6. Your rights</h2>
            <p>
                Depending on your location, you may have the right to access, correct, delete, or restrict the use of
                your personal data. To make a request, please contact us using the details on our Contact Us page.
            </p>
        </section>

        <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">7. Contact</h2>
            <p>
                If you have questions about this Privacy Policy, please reach out through our{' '}
                <Link to="/contact" className="text-gray-900 font-medium underline">Contact Us</Link> page.
            </p>
        </section>
    </LandingPageSection>
);

export default PrivacyPolicy;
