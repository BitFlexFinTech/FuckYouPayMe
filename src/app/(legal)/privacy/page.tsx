export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-black px-6 py-24">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-black uppercase tracking-tighter mb-8">Privacy Policy</h1>
        <p className="text-sm text-zinc-500 font-mono mb-8">Last updated: September 2026</p>

        <div className="space-y-8 text-sm text-zinc-300 leading-relaxed">
          <section>
            <h2 className="text-lg font-bold text-white uppercase tracking-tight mb-3">1. Data We Collect</h2>
            <p>We collect the following data when you use FYPM:</p>
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li><strong>Account Data:</strong> Name, email address, business name, country, and currency preferences.</li>
              <li><strong>Invoice Data:</strong> Client names, email addresses, invoice amounts, line items, payment terms, and notes.</li>
              <li><strong>Payment Data:</strong> Stripe and NOWPayments handle all payment data. We receive transaction IDs, amounts, and statuses, but we do not store credit card numbers, bank account details, or crypto private keys.</li>
              <li><strong>Communication Data:</strong> Email content sent through the dunning engine, including timestamps, open rates, and click rates.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-bold text-white uppercase tracking-tight mb-3">2. How We Use Data</h2>
            <p>We use your data to:</p>
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li>Provide and maintain the FYPM platform</li>
              <li>Send invoices and dunning emails on your behalf</li>
              <li>Process payments through Stripe and NOWPayments</li>
              <li>Generate analytics and improve the platform</li>
              <li>Comply with legal obligations</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-bold text-white uppercase tracking-tight mb-3">3. Data Sharing</h2>
            <p>We share data with the following third-party services necessary for platform operation:</p>
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li><strong>Stripe:</strong> Payment processing, KYC/AML compliance, chargeback handling</li>
              <li><strong>NOWPayments:</strong> Cryptocurrency payment processing</li>
              <li><strong>Resend:</strong> Email delivery (invoices, dunning reminders, notifications)</li>
              <li><strong>Twilio</strong> (optional): SMS delivery for dunning reminders</li>
            </ul>
            <p className="mt-2">We do not sell your data to third parties. We do not use your data for advertising or marketing purposes.</p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-white uppercase tracking-tight mb-3">4. Data Storage</h2>
            <p>Data is stored on servers in the United States (AWS us-east-1 / Vercel). Invoice data is retained indefinitely to maintain accurate records. Freelancers can delete their account, which anonymizes personal data but retains invoice records for historical integrity.</p>
            <p className="mt-2">Payment data is retained per Stripe and NOWPayments&apos; respective data retention policies.</p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-white uppercase tracking-tight mb-3">5. Data Rights</h2>
            <p>You have the right to:</p>
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li>Access your personal data</li>
              <li>Correct inaccurate data</li>
              <li>Delete your account and associated personal data</li>
              <li>Export your data (available via Settings)</li>
            </ul>
            <p className="mt-2">To exercise these rights, contact us at privacy@fuckyoupayme.online.</p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-white uppercase tracking-tight mb-3">6. Security</h2>
            <p>We implement industry-standard security measures including:</p>
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li>Encryption in transit (TLS 1.3)</li>
              <li>Encryption at rest</li>
              <li>No storage of sensitive payment data (tokens handled by Stripe)</li>
              <li>Webhook signature verification for all payment callbacks</li>
              <li>Rate limiting on public endpoints</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-bold text-white uppercase tracking-tight mb-3">7. Changes to This Policy</h2>
            <p>We may update this policy from time to time. Material changes will be notified via email or in-app notification. Continued use of the platform after changes constitutes acceptance of the updated policy.</p>
          </section>
        </div>
      </div>
    </div>
  );
}