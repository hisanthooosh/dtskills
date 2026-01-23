export default function Terms() {
  return (
    <div className="min-h-screen bg-slate-50 font-sans">

      {/* ===== HERO SECTION ===== */}
      <section className="relative bg-gradient-to-br from-slate-900 to-slate-800 py-20 overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute -top-20 -left-20 w-96 h-96 bg-white rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-white rounded-full blur-3xl"></div>
        </div>

        <div className="relative max-w-5xl mx-auto px-6 text-center text-white">
          <h1 className="text-4xl md:text-5xl font-extrabold mb-4">
            Terms & Conditions
          </h1>
          <p className="text-lg text-slate-300 max-w-3xl mx-auto">
            Please read these terms carefully before using DT Skills.
          </p>
        </div>
      </section>

      {/* ===== TERMS CONTENT ===== */}
      <section className="max-w-5xl mx-auto px-6 -mt-20 pb-24">
        <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 p-10 space-y-8">

          {/* INTRO */}
          <div>
            <h2 className="text-xl font-bold text-slate-800 mb-2">
              1. Acceptance of Terms
            </h2>
            <p className="text-slate-600 leading-relaxed">
              By accessing or using <strong>DT Skills</strong>, operated by
              <strong> Doneswari Technologies LLP</strong>, you agree to comply
              with and be bound by these Terms & Conditions.
              If you do not agree, please do not use the platform.
            </p>
          </div>

          {/* ELIGIBILITY */}
          <div>
            <h2 className="text-xl font-bold text-slate-800 mb-2">
              2. User Eligibility
            </h2>
            <p className="text-slate-600 leading-relaxed">
              Users must provide accurate personal, academic, and contact
              information during registration. Any false or misleading
              information may result in account suspension or termination.
            </p>
          </div>

          {/* COURSE ENROLLMENT */}
          <div>
            <h2 className="text-xl font-bold text-slate-800 mb-2">
              3. Course Enrollment & Payment
            </h2>
            <p className="text-slate-600 leading-relaxed">
              Access to courses is granted only after successful payment.
              Each payment allows enrollment into <strong>one course only</strong>.
            </p>
            <p className="text-slate-600 leading-relaxed mt-2">
              Payments are securely processed via Razorpay. DT Skills does not
              store any card, UPI, or banking details on its servers.
            </p>
          </div>

          {/* COURSE USAGE */}
          <div>
            <h2 className="text-xl font-bold text-slate-800 mb-2">
              4. Course Usage Rules
            </h2>
            <ul className="list-disc list-inside text-slate-600 space-y-1">
              <li>Course content is for personal learning only</li>
              <li>Sharing login credentials is strictly prohibited</li>
              <li>Redistribution or resale of content is not allowed</li>
              <li>Unauthorized access may lead to permanent suspension</li>
            </ul>
          </div>

          {/* INTERNSHIP */}
          <div>
            <h2 className="text-xl font-bold text-slate-800 mb-2">
              5. Internship Program
            </h2>
            <p className="text-slate-600 leading-relaxed">
              The internship offered by DT Skills is provided free of cost
              upon successful completion of the course and verification
              requirements.
            </p>
            <p className="text-slate-600 leading-relaxed mt-2">
              Internship participation is subject to performance,
              authenticity of submissions, and compliance with guidelines.
            </p>
          </div>

          {/* CERTIFICATION */}
          <div>
            <h2 className="text-xl font-bold text-slate-800 mb-2">
              6. Certificates & Documents
            </h2>
            <p className="text-slate-600 leading-relaxed">
              Certificates, offer letters, and internship documents are issued
              only after successful completion and verification.
              Any attempt to misuse or falsify documents may result in
              revocation.
            </p>
          </div>

          {/* TERMINATION */}
          <div>
            <h2 className="text-xl font-bold text-slate-800 mb-2">
              7. Account Suspension & Termination
            </h2>
            <p className="text-slate-600 leading-relaxed">
              DT Skills reserves the right to suspend or terminate user accounts
              in cases of policy violations, misuse, fraudulent activity,
              or unethical behavior.
            </p>
          </div>

          {/* MODIFICATIONS */}
          <div>
            <h2 className="text-xl font-bold text-slate-800 mb-2">
              8. Modifications to Services
            </h2>
            <p className="text-slate-600 leading-relaxed">
              DT Skills reserves the right to update, modify, or discontinue
              courses, pricing, features, or policies at any time without
              prior notice.
            </p>
          </div>

          {/* LIABILITY */}
          <div>
            <h2 className="text-xl font-bold text-slate-800 mb-2">
              9. Limitation of Liability
            </h2>
            <p className="text-slate-600 leading-relaxed">
              DT Skills shall not be held liable for indirect, incidental,
              or consequential damages arising from the use of the platform.
            </p>
          </div>

          {/* GOVERNING LAW */}
          <div>
            <h2 className="text-xl font-bold text-slate-800 mb-2">
              10. Governing Law
            </h2>
            <p className="text-slate-600 leading-relaxed">
              These terms shall be governed by and interpreted in accordance
              with the laws of India. Any disputes shall be subject to the
              jurisdiction of courts in Andhra Pradesh.
            </p>
          </div>

          {/* CONTACT */}
          <div>
            <h2 className="text-xl font-bold text-slate-800 mb-2">
              11. Contact Information
            </h2>
            <p className="text-slate-600 leading-relaxed">
              For questions regarding these Terms & Conditions, contact us at:
            </p>
            <p className="mt-2 text-slate-700">
              📧 <strong>Email:</strong> doneswarisoftwaresolutions@gmail.com <br />
              📞 <strong>Phone:</strong> +91 91828 45569 <br />
              📍 <strong>Location:</strong> Chittoor, Andhra Pradesh, India
            </p>
          </div>

          {/* FINAL NOTE */}
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-5 text-sm text-blue-800">
            <strong>Important:</strong> By using DT Skills and completing a
            payment, you confirm that you have read, understood, and agreed
            to these Terms & Conditions.
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
