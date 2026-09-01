export default function TermsPage() {
  return (
    <div className="min-h-screen bg-black px-6 py-24">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-black uppercase tracking-tighter mb-8">Terms of Service</h1>
        <p className="text-sm text-zinc-500 font-mono mb-8">Last updated: September 2026</p>

        <div className="space-y-8 text-sm text-zinc-300 leading-relaxed">
          <section>
            <h2 className="text-lg font-bold text-white uppercase tracking-tight mb-3">1. Platform Role</h2>
            <p>FuckYouPayMe (&quot;FYPM&quot;) is a software-as-a-service platform that provides invoicing, payment collection, and dunning automation tools for freelancers, agencies, and independent contractors. FYPM is not a financial institution, money transmitter, bank, payment processor, or law firm.</p>
            <p className="mt-2">FYPM does not hold, custody, or transmit client funds. All payment processing is handled by third-party processors: Stripe (for fiat/card payments) and NOWPayments (for cryptocurrency payments).</p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-white uppercase tracking-tight mb-3">2. Platform Fee</h2>
            <p>FYPM charges a platform fee of 2.5% of the gross invoice amount on each successfully processed payment. This fee is deducted before settlement to the freelancer. The fee is non-refundable once a payment has been processed.</p>
            <p className="mt-2">Freelancers may choose to absorb the platform fee (meaning the client pays the full invoice amount and the freelancer receives the net amount after fee deduction).</p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-white uppercase tracking-tight mb-3">3. Freelancer Obligations</h2>
            <p>As a freelancer using FYPM, you agree that:</p>
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li>You are solely responsible for your own tax obligations, including income tax, self-employment tax, VAT, and any other applicable taxes.</li>
              <li>You are responsible for the accuracy of all invoice data, client information, and payment amounts.</li>
              <li>You will not use FYPM to invoice for illegal goods or services.</li>
              <li>You will comply with all applicable laws regarding debt collection if you enable the dunning engine.</li>
              <li>Dunning email templates are provided as examples only. You are responsible for the content of emails sent to your clients.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-bold text-white uppercase tracking-tight mb-3">4. Client Payment</h2>
            <p>Clients who receive invoices via FYPM are not required to create an account. Payment is processed directly through Stripe or NOWPayments. FYPM does not store credit card numbers, bank account details, or crypto private keys.</p>
            <p className="mt-2">Cryptocurrency payments are processed on a non-custodial basis. Once a crypto payment is sent to the provided address, the transaction is final. FYPM cannot reverse cryptocurrency transactions.</p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-white uppercase tracking-tight mb-3">5. Chargebacks & Disputes</h2>
            <p>Chargebacks on card payments are handled by Stripe in accordance with their policies. FYPM is not liable for chargeback losses. If a chargeback is lost, the invoice returns to overdue status, and the freelancer bears the loss.</p>
            <p className="mt-2">Clients may flag an invoice as disputed via the payment page. While a dispute is open, dunning emails are paused. The freelancer can resolve the dispute by marking it as paid, voiding the invoice, or continuing dunning.</p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-white uppercase tracking-tight mb-3">6. Dunning Engine</h2>
            <p>The dunning engine is an automated email reminder system. It is not a legal collections agency. The &quot;nuclear&quot; level emails include templates that reference small claims court and credit reporting, but these are provided as examples only. FYPM is not a law firm and does not provide legal advice.</p>
            <p className="mt-2">Freelancers who enable the &quot;nuclear&quot; escalation level should consult with a qualified attorney before making legal threats, filing small claims, or reporting debts to credit agencies.</p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-white uppercase tracking-tight mb-3">7. Limitation of Liability</h2>
            <p>FYPM is provided &quot;as is&quot; without warranty of any kind. In no event shall FYPM be liable for any indirect, incidental, special, consequential, or punitive damages arising from your use of the platform. Our total liability is limited to the total platform fees paid by you in the 12 months preceding the claim.</p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-white uppercase tracking-tight mb-3">8. Termination</h2>
            <p>Freelancers may delete their account at any time via the Settings page. Upon deletion, invoice data is retained for record-keeping purposes but associated with an anonymized identifier. FYPM may suspend or terminate accounts that violate these terms.</p>
          </section>
        </div>
      </div>
    </div>
  );
}