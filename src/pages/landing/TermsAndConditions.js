import React from 'react';
import { Link } from 'react-router-dom';
import LandingPageSection from '../../components/landing/LandingPageSection';

const TermsAndConditions = () => (
    <LandingPageSection title="Terms and Conditions">
        <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">1. Acceptance of terms</h2>
            <p>
                By accessing or using RYDE&apos;s mobile application, website, or related services, you agree to be
                bound by these Terms and Conditions. If you do not agree, please do not use our services.
            </p>
        </section>

        <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">2. Service description</h2>
            <p>
                RYDE provides a technology platform that connects passengers with drivers and offers related transport
                services including ride booking, trip management, vehicle rentals, auctions, and subscription plans.
                RYDE is not a transport provider and does not own or operate vehicles.
            </p>
        </section>

        <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">3. User accounts</h2>
            <ul className="list-disc pl-5 space-y-2">
                <li>You must provide accurate registration information and keep your account credentials secure.</li>
                <li>You are responsible for all activity that occurs under your account.</li>
                <li>We may suspend or terminate accounts that violate these terms or applicable law.</li>
            </ul>
        </section>

        <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">4. Payments and fees</h2>
            <p>
                Fares, rental rates, auction prices, and subscription fees are displayed before you confirm a transaction.
                Payments are processed through approved payment partners. Refunds, where applicable, are handled according
                to our payment and cancellation policies.
            </p>
        </section>

        <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">5. User conduct</h2>
            <p>You agree not to:</p>
            <ul className="list-disc pl-5 space-y-2 mt-2">
                <li>Use the platform for unlawful, fraudulent, or abusive purposes.</li>
                <li>Interfere with the operation or security of RYDE services.</li>
                <li>Harass drivers, passengers, or RYDE staff.</li>
                <li>Provide false trip, vehicle, or identity information.</li>
            </ul>
        </section>

        <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">6. Limitation of liability</h2>
            <p>
                RYDE provides the platform on an &quot;as is&quot; basis. To the fullest extent permitted by law, RYDE
                is not liable for indirect, incidental, or consequential damages arising from your use of the service.
                Transport services are provided by independent drivers and third parties.
            </p>
        </section>

        <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">7. Changes to terms</h2>
            <p>
                We may update these Terms and Conditions from time to time. Continued use of RYDE after changes are
                posted constitutes acceptance of the revised terms.
            </p>
        </section>

        <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">8. Contact</h2>
            <p>
                For questions about these terms, please visit our{' '}
                <Link to="/contact" className="text-gray-900 font-medium underline">Contact Us</Link> page.
            </p>
        </section>
    </LandingPageSection>
);

export default TermsAndConditions;
