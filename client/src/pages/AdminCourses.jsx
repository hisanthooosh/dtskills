export default function AdminCourses() {
  return (
    <div className="p-10">
      <h1 className="text-2xl font-bold mb-6">
        Course Management
      </h1>

      <div className="grid grid-cols-2 gap-6">
        <div className="p-6 bg-white rounded-xl shadow">
          <h2 className="font-bold mb-2">Create Course</h2>
          <p className="text-sm text-gray-500">
            Add new course with modules & topics
          </p>
        </div>

        <div className="p-6 bg-white rounded-xl shadow">
          <h2 className="font-bold mb-2">Manage Courses</h2>
          <p className="text-sm text-gray-500">
            Edit / Publish existing courses
          </p>
        </div>
      </div>
    </div>
  );
}
