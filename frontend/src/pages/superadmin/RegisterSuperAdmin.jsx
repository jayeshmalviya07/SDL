import React from "react";

const RegisterSuperAdmin = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 via-white to-gray-100 px-4">
      
      <div className="max-w-5xl w-full bg-white shadow-2xl rounded-2xl overflow-hidden grid grid-cols-1 md:grid-cols-2">

        {/* Left Side Illustration */}
        <div className="hidden md:flex items-center justify-center bg-gradient-to-br from-indigo-500 to-blue-600 p-10">
          <div className="text-white text-center">
            <h2 className="text-3xl font-bold mb-4">
              Create Super Admin
            </h2>
            <p className="text-sm opacity-90">
              Manage your system with full control and security.
            </p>
          </div>
        </div>

        {/* Right Side Form */}
        <div className="p-8 sm:p-10">

          <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
            SuperAdmin Registration
          </h2>

          <form className="space-y-4">

            {/* Name */}
            <div>
              <label className="block text-sm font-medium text-gray-600">
                Full Name
              </label>
              <input
                type="text"
                placeholder="Enter full name"
                className="w-full mt-1 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>

            {/* Username */}
            <div>
              <label className="block text-sm font-medium text-gray-600">
                Username
              </label>
              <input
                type="text"
                placeholder="Enter username"
                className="w-full mt-1 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-600">
                Email
              </label>
              <input
                type="email"
                placeholder="Enter email"
                className="w-full mt-1 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>

            {/* Phone */}
            <div>
              <label className="block text-sm font-medium text-gray-600">
                Phone Number
              </label>
              <input
                type="tel"
                placeholder="Enter phone number"
                className="w-full mt-1 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>

            {/* DOB */}
            <div>
              <label className="block text-sm font-medium text-gray-600">
                Date of Birth
              </label>
              <input
                type="date"
                className="w-full mt-1 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-gray-600">
                Password
              </label>
              <input
                type="password"
                placeholder="Enter password"
                className="w-full mt-1 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>

            {/* Button */}
            <button
              type="submit"
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-2 rounded-lg font-semibold transition duration-300 shadow-md"
            >
              Register
            </button>

          </form>

        </div>
      </div>
    </div>
  );
};

export default RegisterSuperAdmin;
