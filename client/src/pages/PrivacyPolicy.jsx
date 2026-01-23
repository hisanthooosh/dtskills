export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-slate-50 font-sans">

      {/* ===== HERO SECTION ===== */}
      <section className="relative bg-gradient-to-br from-slate-900 to-slate-800 py-20 overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute -top-20 -left-20 w-96 h-96 bg-blue-500 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-indigo-500 rounded-full blur-3xl"></div>
        </div>

        <div className="relative max-w-5xl mx-auto px-6 text-center text-white">
          <h1 className="text-4xl md:text-5xl font-extrabold mb-4">
            Privacy Policy
          </h1>
          <p className="text-lg text-slate-300 max-w-3xl mx-auto">
            Your privacy is important to us. This policy explains how
            DT Skills collects, uses, and protects your information.
          </p>
        </div>
      </section>

      {/* ===== POLICY CONTENT ===== */}
      <section className="max-w-5xl mx-auto px-6 -mt-20 pb-24">
        <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 p-10 space-y-8">

          {/* INTRO */}
          <div>
            <h2 className="text-xl font-bold text-slate-800 mb-2">
              1. Introduction
            </h2>
            <p className="text-slate-600 leading-relaxed">
              DT Skills is operated by <strong>Doneswari Technologies LLP</strong>.
              We are committed to safeguarding the personal information of
              students, interns, and users who access our platform.
            </p>
          </div>

          {/* DATA COLLECTION */}
          <div>
            <h2 className="text-xl font-bold text-slate-800 mb-2">
              2. Information We Collect
            </h2>
            <p className="text-slate-600 leading-relaxed">
              We may collect the following information when you register or
              use our services:
            </p>
            <ul className="list-disc list-inside text-slate-600 mt-3 space-y-1">
              <li>Name, email address, and phone number</li>
              <li>College, department, and academic details</li>
              <li>Course enrollment and internship progress</li>
              <li>Payment confirmation and transaction references</li>
            </ul>
          </div>

          {/* USE OF DATA */}
          <div>
            <h2 className="text-xl font-bold text-slate-800 mb-2">
              3. How We Use Your Information
            </h2>
            <p className="text-slate-600 leading-relaxed">
              Your information is used strictly for:
            </p>
            <ul className="list-disc list-inside text-slate-600 mt-3 space-y-1">
              <li>Course enrollment and learning management</li>
              <li>Internship eligibility and certification</li>
              <li>Issuing certificates and offer letters</li>
              <li>Payment verification and transaction records</li>
              <li>Official communication and support</li>
            </ul>
          </div>

          {/* PAYMENTS */}
          <div>
            <h2 className="text-xl font-bold text-slate-800 mb-2">
              4. Payments & Security
            </h2>
            <p className="text-slate-600 leading-relaxed">
              All payments on DT Skills are securely processed through
              <strong> Razorpay</strong>, an RBI-authorized payment gateway.
              We do <strong>not</strong> store any card, UPI, or banking details
              on our servers.
            </p>
          </div>

          {/* DATA SHARING */}
          <div>
            <h2 className="text-xl font-bold text-slate-800 mb-2">
              5. Data Sharing & Disclosure
            </h2>
            <p className="text-slate-600 leading-relaxed">
              We do not sell, rent, or trade your personal data to third parties.
              Information may be shared only when required by law or government
              authorities.
            </p>
          </div>

          {/* DATA PROTECTION */}
          <div>
            <h2 className="text-xl font-bold text-slate-800 mb-2">
              6. Data Protection
            </h2>
            <p className="text-slate-600 leading-relaxed">
              We use industry-standard security measures to protect your data
              from unauthorized access, misuse, or disclosure.
            </p>
          </div>

          {/* USER RIGHTS */}
          <div>
            <h2 className="text-xl font-bold text-slate-800 mb-2">
              7. Your Rights
            </h2>
            <p className="text-slate-600 leading-relaxed">
              You have the right to access, update, or request deletion of your
              personal information by contacting our support team.
            </p>
          </div>

          {/* CONTACT */}
          <div>
            <h2 className="text-xl font-bold text-slate-800 mb-2">
              8. Contact Information
            </h2>
            <p className="text-slate-600 leading-relaxed">
              For any questions regarding this Privacy Policy, you may contact us at:
            </p>
            <p className="mt-2 text-slate-700">
              📧 <strong>Email:</strong> doneswarisoftwaresolutions@gmail.com <br />
              📞 <strong>Phone:</strong> +91 91828 45569 <br />
              📍 <strong>Location:</strong> Chittoor, Andhra Pradesh, India
            </p>
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
