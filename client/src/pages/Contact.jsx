export default function Contact() {
  return (
    <div className="min-h-screen bg-slate-50 font-sans">

      {/* ===== HERO SECTION ===== */}
      <section className="relative overflow-hidden bg-gradient-to-br from-blue-600 to-indigo-700 py-20">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute -top-20 -left-20 w-96 h-96 bg-white rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-white rounded-full blur-3xl"></div>
        </div>

        <div className="relative max-w-5xl mx-auto px-6 text-center text-white">
          <h1 className="text-4xl md:text-5xl font-extrabold mb-4">
            Get in Touch with DT Skills
          </h1>
          <p className="text-lg md:text-xl text-blue-100 max-w-3xl mx-auto">
            Questions about courses, payments, internships, or certificates?
            Our team is here to support you at every step.
          </p>
        </div>
      </section>

      {/* ===== CONTACT CONTENT ===== */}
      <section className="max-w-6xl mx-auto px-6 -mt-20 pb-24">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">

          {/* ===== CONTACT CARD ===== */}
          <div className="md:col-span-2 bg-white rounded-3xl shadow-2xl border border-slate-200 p-10">
            <h2 className="text-2xl font-bold text-slate-800 mb-6">
              Official Contact Information
            </h2>

            <div className="space-y-6 text-slate-700">

              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center text-xl">
                  🏢
                </div>
                <div>
                  <p className="font-semibold">Company</p>
                  <p className="text-slate-600">
                    Doneswari Technologies LLP
                  </p>
                  <p className="text-xs text-slate-400">
                    Operating Platform: DT Skills
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-indigo-100 text-indigo-600 rounded-xl flex items-center justify-center text-xl">
                  📧
                </div>
                <div>
                  <p className="font-semibold">Email</p>
                  <a
                    href="mailto:doneswarisoftwaresolutions@gmail.com"
                    className="text-blue-600 hover:underline"
                  >
                    doneswarisoftwaresolutions@gmail.com
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-green-100 text-green-600 rounded-xl flex items-center justify-center text-xl">
                  📞
                </div>
                <div>
                  <p className="font-semibold">Phone</p>
                  <p className="text-slate-600">+91 91828 45569</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-yellow-100 text-yellow-600 rounded-xl flex items-center justify-center text-xl">
                  📍
                </div>
                <div>
                  <p className="font-semibold">Location</p>
                  <p className="text-slate-600">
                    Chittoor, Andhra Pradesh, India
                  </p>
                </div>
              </div>

            </div>
          </div>

          {/* ===== SUPPORT INFO CARD ===== */}
          <div className="bg-slate-900 text-white rounded-3xl shadow-2xl p-10 flex flex-col justify-between">

            <div>
              <h3 className="text-xl font-bold mb-4">
                Support & Business Hours
              </h3>

              <p className="text-slate-300 mb-6 leading-relaxed">
                Our support team is available during business hours to assist
                with enrollment, payments, internships, certificates, and
                verification requests.
              </p>

              <div className="bg-slate-800 rounded-xl p-6 text-sm space-y-2">
                <p>
                  <strong>🕒 Working Days:</strong><br />
                  Monday – Saturday
                </p>
                <p>
                  <strong>⏰ Timings:</strong><br />
                  10:00 AM – 6:00 PM (IST)
                </p>
              </div>
            </div>

            <div className="mt-8 text-xs text-slate-400">
              For official communication and payment-related queries,
              please contact us only through the above email or phone number.
            </div>
          </div>

        </div>

        {/* ===== TRUST STRIP ===== */}
        <div className="mt-16 text-center">
          <p className="text-sm text-slate-500">
            DT Skills is operated by <strong>Doneswari Technologies LLP</strong>.
            All payments are processed securely via authorized payment gateways.
          </p>
        </div>
      </section>

    </div>
  );
}
