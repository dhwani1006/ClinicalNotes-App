import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { PlusSquare, ClipboardList, Users, Clock } from "lucide-react";
import { jwtDecode } from "jwt-decode";

export default function Dashboard() {
  const token = localStorage.getItem("token"); // where you saved JWT after login

  let doctorName = "Doctor";

  if (token) {
    try {
      const decoded = jwtDecode(token);
      console.log("DECODED TOKEN:", decoded);
      doctorName = decoded.name || "Doctor";
    } catch (e) {
      console.log("Token error");
    }
  }

  const [notes, setNotes] = useState([]);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL}/api/notes`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await res.json();
        setNotes(data || []);
      } catch (err) {
        console.error("Failed to fetch notes for dashboard", err);
      }
    };

    if (token) {
      fetchStats();
    }
  }, [token]);

  // ✅ Compute stats from user's notes only
  const totalNotes = notes.length;

  const uniquePatients = new Set(
    notes.map((n) => n.patientName?.trim()).filter(Boolean)
  ).size;

  const lastUpdated =
    notes.length > 0
      ? new Date(notes[0].createdAt).toLocaleDateString()
      : "No notes yet";

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-semibold text-gray-900">
          Dr. {doctorName} 👋
        </h1>
        <p className="text-gray-600 mt-1">
          Here’s a quick overview of your clinical activity.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {/* Total Notes */}
        <div className="bg-white rounded-2xl p-6 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-100 text-[#1877F2] flex items-center justify-center">
            <ClipboardList />
          </div>
          <div>
            <p className="text-sm text-gray-500">Total Notes</p>
            <p className="text-2xl font-semibold text-gray-900">
              {totalNotes}
            </p>
          </div>
        </div>

        {/* Patients */}
        <div className="bg-white rounded-2xl p-6 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-green-100 text-green-600 flex items-center justify-center">
            <Users />
          </div>
          <div>
            <p className="text-sm text-gray-500">Patients</p>
            <p className="text-2xl font-semibold text-gray-900">
              {uniquePatients}
            </p>
          </div>
        </div>

        {/* Last Updated */}
        <div className="bg-white rounded-2xl p-6 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center">
            <Clock />
          </div>
          <div>
            <p className="text-sm text-gray-500">Last Updated</p>
            <p className="text-lg font-semibold text-gray-900">
              {lastUpdated}
            </p>
          </div>
        </div>
      </div>

      {/* Create New Note Card */}
      <div className="bg-white rounded-2xl p-6 shadow-sm flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">
            Create a new clinical note
          </h2>
          <p className="text-sm text-gray-600 mt-1">
            Start documenting patient consultations quickly and securely.
          </p>
        </div>

        <Link
          to="/new-note"
          className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-[#1877F2] text-white font-medium shadow hover:bg-[#1664d4] transition"
        >
          <PlusSquare size={18} />
          New Note
        </Link>
      </div>
    </div>
  );
}

