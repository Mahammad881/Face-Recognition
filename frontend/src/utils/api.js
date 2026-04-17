// frontend/src/utils/api.js


const API_BASE_URL = "https://face-recognition-q7ah.onrender.com";

// TOKEN UTILS
// ==============================

export const getUserFromToken = () => {
  const token = localStorage.getItem("authToken");

  if (!token) return null;

  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    return payload;
  } catch (err) {
    console.error("Invalid token");
    return null;
  }
};
/**
 * Handle fetch responses
 */
const handleResponse = async (response) => {
  const contentType = response.headers.get("content-type");

  const data =
    contentType && contentType.includes("application/json")
      ? await response.json()
      : null;

  if (!response.ok) {
    throw new Error(data?.message || `HTTP error! Status: ${response.status}`);
  }

  return data;
};

/**
 * Get auth header
 */

const getAuthHeader = () => {
  const token = localStorage.getItem("authToken"); // ✅ FIXED

  if (!token) {
    throw new Error("User not authenticated. Please login.");
  }

  return {
    Authorization: `Bearer ${token}`,
  };
};
// ==============================
// AUTH
// ==============================

export const loginUser = async (credentials) => {
  const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(credentials),
  });

  return handleResponse(response);
};

// ==============================
// DASHBOARD
// ==============================



export const getDashboardStats = async () => {
  const response = await fetch(`${API_BASE_URL}/api/dashboard/stats`, {
    headers: {
      "Content-Type": "application/json",
      ...getAuthHeader(), // ✅ add back
    },
  });

  return handleResponse(response);
};

// ==============================
// STUDENTS
// ==============================

export const getStudentDescriptors = async () => {
  const response = await fetch(`${API_BASE_URL}/api/students/descriptors`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      ...getAuthHeader(),
    },
  });

  return handleResponse(response); // ✅ FIXED
};

export const enrollStudent = async (studentData) => {
  const { studentId, name, email, department, faceDescriptor } = studentData;

  // 1. Save student (basic info)
  await handleResponse(
    await fetch(`${API_BASE_URL}/api/students`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...getAuthHeader(),
      },
      body: JSON.stringify({
        studentId,
        name,
        email,
        department,
      }),
    })
  );

  // 2. Save face separately
  await handleResponse(
    await fetch(`${API_BASE_URL}/api/student_faces`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...getAuthHeader(),
      },
      body: JSON.stringify({
        studentId,
        faceDescriptor,
      }),
    })
  );
};

// ==============================
// ATTENDANCE
// ==============================

export const markPresent = async (studentId) => {
  const response = await fetch(`${API_BASE_URL}/api/attendance/present`, { // ✅ FIXED
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      // ...getAuthHeader(), (optional remove for now)
    },
    body: JSON.stringify({ studentId }),
  });

  return handleResponse(response);
};


export const getAttendanceRecords = async () => {
  const response = await fetch(`${API_BASE_URL}/api/attendance`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      ...getAuthHeader(),
    },
  });

  return handleResponse(response);
};
export const deleteAttendanceRecord = async (id) => {
  const response = await fetch(`${API_BASE_URL}/api/attendance/${id}`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
      ...getAuthHeader(),
    },
  });

  return handleResponse(response);
};

export const updateAttendanceRecord = async (id, data) => {
  const response = await fetch(`${API_BASE_URL}/api/attendance/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      ...getAuthHeader(),
    },
    body: JSON.stringify(data),
  });

  return handleResponse(response);
};