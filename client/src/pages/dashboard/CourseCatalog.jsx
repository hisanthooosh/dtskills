import { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { BookOpen, Clock, CheckCircle } from 'lucide-react';

export default function CourseCatalog() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const student = JSON.parse(localStorage.getItem('student'));

  useEffect(() => {
    // Fetch all available courses
    axios.get(`${import.meta.env.VITE_API_BASE_URL}/courses`)

      .then(res => {
        setCourses(res.data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  const handlePayment = async (course) => {
    try {
      const student = JSON.parse(localStorage.getItem('student'));

      if (!student?._id) {
        alert("Please login again");
        return;
      }

      // 1️⃣ CREATE ORDER (BACKEND)
      const orderRes = await axios.post(
        `${import.meta.env.VITE_API_BASE_URL}/payment/create-order`,
        {
          courseId: course._id,
          amount: course.price,
          userId: student._id
        }
      );

      const { orderId, amount, key } = orderRes.data;

      // 2️⃣ OPEN RAZORPAY CHECKOUT
      const options = {
        key,
        amount,
        currency: "INR",
        order_id: orderId,
        name: "DT Skills",
        description: course.title,

        handler: async function (response) {
          // 3️⃣ VERIFY PAYMENT (BACKEND)
          await axios.post(
            `${import.meta.env.VITE_API_BASE_URL}/payment/verify`,
            {
              ...response,
              courseId: course._id,
              userId: student._id
            }
          );

          alert("Payment successful 🎉");
          window.location.href = "/dashboard/my-learning";
        },

        theme: {
          color: "#2563eb"
        }
      };

      const razorpay = new window.Razorpay(options);
      razorpay.open();

    } catch (err) {
      console.error(err);
      alert("Payment failed or cancelled");
    }
  };


  if (loading) return <div className="p-10 text-center">Loading Available Courses...</div>;

  return (
    <div className="max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold text-slate-800 mb-6">Course Catalog</h1>

      <div className="grid md:grid-cols-3 gap-6">
        {courses.map(course => (
          <div key={course._id} className="bg-white border border-slate-200 rounded-xl p-6 hover:shadow-lg transition flex flex-col h-full">
            <div className="h-12 w-12 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center font-bold text-xl mb-4">
              {course.title.charAt(0)}
            </div>

            <h3 className="text-xl font-bold text-slate-900 mb-2">{course.title}</h3>
            <p className="text-slate-500 text-sm mb-4 flex-1">{course.description}</p>

            <div className="flex items-center gap-4 text-xs text-slate-400 mb-6 border-t pt-4">
              <span className="flex items-center gap-1"><BookOpen size={14} /> {course.chapters?.length || 0} Chapters</span>
              <span className="flex items-center gap-1"><Clock size={14} /> 45 Days</span>
            </div>

            <div className="flex items-center justify-between mt-auto">
              <span className="text-xl font-bold text-slate-900">₹{course.price}</span>
              <button
                onClick={() => handlePayment(course)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-bold"
              >
                Pay ₹{course.price}
              </button>

            </div>
          </div>
        ))}
      </div>
    </div>
  );
}