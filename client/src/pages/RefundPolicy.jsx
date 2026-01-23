export default function RefundPolicy() {
  return (
    <div className="min-h-screen bg-slate-50 font-sans">

      {/* ===== HERO SECTION ===== */}
      <section className="relative bg-gradient-to-br from-rose-600 to-red-700 py-20 overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute -top-20 -left-20 w-96 h-96 bg-white rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-white rounded-full blur-3xl"></div>
        </div>

        <div className="relative max-w-5xl mx-auto px-6 text-center text-white">
          <h1 className="text-4xl md:text-5xl font-extrabold mb-4">
            Refund & Cancellation Policy
          </h1>
          <p className="text-lg text-rose-100 max-w-3xl mx-auto">
            Please read this policy carefully before making a payment on DT Skills.
          </p>
        </div>
      </section>

      {/* ===== POLICY CONTENT ===== */}
      <section className="max-w-5xl mx-auto px-6 -mt-20 pb-24">
        <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 p-10 space-y-8">

          {/* INTRO */}
          <div>
            <h2 className="text-xl font-bold text-slate-800 mb-2">
              1. Overview
            </h2>
            <p className="text-slate-600 leading-relaxed">
              This Refund & Cancellation Policy applies to all course purchases
              made on <strong>DT Skills</strong>, operated by
              <strong> Doneswari Technologies LLP</strong>.
              By enrolling in any course, you agree to the terms outlined below.
            </p>
          </div>

          {/* NO REFUND POLICY */}
          <div>
            <h2 className="text-xl font-bold text-slate-800 mb-2">
              2. No-Refund Policy
            </h2>
            <p className="text-slate-600 leading-relaxed">
              Once a course is purchased and access to learning content,
              dashboards, or materials is granted, the payment is considered
              <strong> final and non-refundable</strong>.
            </p>
            <p className="text-slate-600 leading-relaxed mt-2">
              This is because digital content and internship resources
              are made available immediately after successful payment.
            </p>
          </div>

          {/* EXCEPTIONAL CASES */}
          <div>
            <h2 className="text-xl font-bold text-slate-800 mb-2">
              3. Exceptional Refund Cases
            </h2>
            <p className="text-slate-600 leading-relaxed">
              Refunds may be considered only in the following exceptional situations:
            </p>
            <ul className="list-disc list-inside text-slate-600 mt-3 space-y-1">
              <li>Duplicate payment for the same course</li>
              <li>Payment deducted but enrollment not activated due to technical error</li>
              <li>Incorrect amount charged because of a system issue</li>
            </ul>
          </div>

          {/* REFUND REQUEST PROCESS */}
          <div>
            <h2 className="text-xl font-bold text-slate-800 mb-2">
              4. Refund Request Process
            </h2>
            <p className="text-slate-600 leading-relaxed">
              To request a refund, you must contact our support team
              within <strong>48 hours</strong> of the payment date.
            </p>
            <p className="text-slate-600 leading-relaxed mt-2">
              Your request must include valid proof such as payment ID,
              transaction reference, and registered email address.
            </p>
          </div>

          {/* REFUND TIMELINE */}
          <div>
            <h2 className="text-xl font-bold text-slate-800 mb-2">
              5. Refund Processing Timeline
            </h2>
            <p className="text-slate-600 leading-relaxed">
              If a refund request is approved, the amount will be processed
              back to the original payment method within
              <strong> 7–10 working days</strong>, depending on the bank or payment provider.
            </p>
          </div>

          {/* PAYMENT GATEWAY */}
          <div>
            <h2 className="text-xl font-bold text-slate-800 mb-2">
              6. Payment Gateway
            </h2>
            <p className="text-slate-600 leading-relaxed">
              All payments on DT Skills are securely processed through
              <strong> Razorpay</strong>.
              Refunds, if approved, will be handled via the same payment gateway.
            </p>
          </div>

          {/* CONTACT */}
          <div>
            <h2 className="text-xl font-bold text-slate-800 mb-2">
              7. Contact for Refund Queries
            </h2>
            <p className="text-slate-600 leading-relaxed">
              For refund or payment-related queries, contact us at:
            </p>
            <p className="mt-2 text-slate-700">
              📧 <strong>Email:</strong> doneswarisoftwaresolutions@gmail.com <br />
              📞 <strong>Phone:</strong> +91 91828 45569 <br />
              📍 <strong>Location:</strong> Chittoor, Andhra Pradesh, India
            </p>
          </div>

          {/* FINAL NOTE */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-5 text-sm text-yellow-800">
            <strong>Note:</strong> By completing a payment on DT Skills,
            you acknowledge that you have read and agreed to this
            Refund & Cancellation Policy.
          </div>

          {/* LAST UPDATED */}
          <div className="pt-6 border-t border-slate-200 text-sm text-slate-400">
            Last updated: {new Date().toLocaleDateString()}
          </div>

        </div>
      </section>
    </div>
  );
}
