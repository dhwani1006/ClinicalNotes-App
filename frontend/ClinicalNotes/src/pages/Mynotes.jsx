import { useEffect, useState } from "react";
import { FaWhatsapp, FaFilePdf } from "react-icons/fa";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

const PAGE_SIZE = 10;

export default function Mynotes() {
  const [notes, setNotes] = useState([]);
  const [selectedNote, setSelectedNote] = useState(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetchNotes();
  }, []);

  const fetchNotes = async () => {
  try {
    const token = localStorage.getItem("token");
    const res = await fetch(`${import.meta.env.VITE_API_URL}/api/notes`, {
      headers: {
        Authorization: `Bearer ${token}`, // ✅ send token
      },
    });
    if (!res.ok) {
      throw new Error("Failed to fetch notes");
    }
    const data = await res.json();
    setNotes(data);
    setLoading(false);
  } catch (err) {
    console.error(err);
    setLoading(false);
  }
};

  const formatDateTime = (dateStr) => {
    const d = new Date(dateStr);
    const date = d.toLocaleDateString(undefined, {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
    const time = d.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
    return `${date} • ${time}`;
  };

  const formatMedicine = (m) => {
    const parts = [];
    if (m.dose) parts.push(m.dose);
    if (m.frequency) parts.push(m.frequency);
    if (m.duration) parts.push(m.duration);
    if (m.instructions) parts.push(m.instructions);
    return parts.length ? parts.join(" • ") : "";
  };

  const filteredNotes = notes.filter((n) => {
    const q = search.toLowerCase();
    return (
      (n.patientName || "").toLowerCase().includes(q) ||
      (n.phone || "").toLowerCase().includes(q) ||
      (n.diagnosis || "").toLowerCase().includes(q)
    );
  });

  const totalPages = Math.ceil(filteredNotes.length / PAGE_SIZE) || 1;
  const start = (page - 1) * PAGE_SIZE;
  const currentNotes = filteredNotes.slice(start, start + PAGE_SIZE);

  // 📄 Generate PDF (FULL HEIGHT + MULTI PAGE)
  const generatePDF = async () => {
    if (!selectedNote) {
      alert("Please select a note first");
      return;
    }

    const element = document.getElementById("note-print-area");
    if (!element) {
      alert("Printable area not found");
      return;
    }

    const pdf = new jsPDF("p", "mm", "a4");

    await pdf.html(element, {
      x: 10,
      y: 10,
      width: 190, // A4 width minus margins
      windowWidth: element.scrollWidth,
      autoPaging: "text",
      callback: function (pdf) {
        pdf.save(`Prescription-${selectedNote.patientName || "Patient"}.pdf`);
      },
    });
  };

  // 📤 Open WhatsApp
  const sendOnWhatsApp = (note) => {
    if (!note.phone) {
      alert("No phone number found for this patient");
      return;
    }

    let phone = note.phone.replace(/\D/g, "");
    if (phone.length === 10) phone = "91" + phone;

    const msg = encodeURIComponent(
      "Hello, your prescription is ready. I am sending you the PDF."
    );

    window.open(`https://wa.me/${phone}?text=${msg}`, "_blank");
  };

  useEffect(() => {
    setPage(1);
  }, [search]);

  return (
    <div className="max-w-7xl mx-auto p-6 grid grid-cols-12 gap-6">
      {/* Left: Notes List */}
      <div className="col-span-4 bg-white rounded-xl shadow-sm p-4 flex flex-col">
        <h2 className="text-lg font-semibold mb-3">My Notes</h2>

        <input
          type="text"
          placeholder="Search by name, phone, diagnosis..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="mb-4 px-3 py-2 border rounded-lg text-sm outline-none focus:border-blue-400"
        />

        {loading && <p className="text-sm text-gray-500">Loading...</p>}

        {!loading && filteredNotes.length === 0 && (
          <p className="text-sm text-gray-500">No notes found.</p>
        )}

        <div className="space-y-3 flex-1 overflow-auto">
          {currentNotes.map((note) => (
            <div
              key={note._id}
              className={`p-3 rounded-lg border hover:bg-gray-50 flex items-center justify-between ${
                selectedNote?._id === note._id
                  ? "bg-blue-50 border-blue-400"
                  : ""
              }`}
            >
              <div
                onClick={() => setSelectedNote(note)}
                className="cursor-pointer flex-1"
              >
                <div className="font-medium text-gray-900">
                  {note.patientName || "Unnamed Patient"}
                </div>
                <div className="text-sm text-gray-600 truncate">
                  {note.diagnosis || "No diagnosis"}
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  {formatDateTime(note.createdAt)}
                </div>
              </div>

              {/* Download + WhatsApp icons */}
              <div className="flex items-center gap-2 ml-3">
                <button
                  onClick={() => {
                    setSelectedNote(note);
                    setTimeout(generatePDF, 0);
                  }}
                  title="Download PDF"
                  className="text-red-600 hover:text-red-700"
                >
                  <FaFilePdf size={20} />
                </button>

                <button
                  onClick={() => sendOnWhatsApp(note)}
                  title="Send on WhatsApp"
                  className="text-green-600 hover:text-green-700"
                >
                  <FaWhatsapp size={22} />
                </button>
              </div>
            </div>
          ))}
        </div>

        {totalPages > 1 && (
          <div className="flex items-center justify-between mt-4 text-sm">
            <button
              disabled={page === 1}
              onClick={() => setPage((p) => p - 1)}
              className={`px-3 py-1 rounded border ${
                page === 1
                  ? "text-gray-400 border-gray-200 cursor-not-allowed"
                  : "hover:bg-gray-50"
              }`}
            >
              Previous
            </button>

            <span className="text-gray-600">
              Page {page} of {totalPages}
            </span>

            <button
              disabled={page === totalPages}
              onClick={() => setPage((p) => p + 1)}
              className={`px-3 py-1 rounded border ${
                page === totalPages
                  ? "text-gray-400 border-gray-200 cursor-not-allowed"
                  : "hover:bg-gray-50"
              }`}
            >
              Next
            </button>
          </div>
        )}
      </div>

      {/* Right: Note Details */}
      <div className="col-span-8 bg-white rounded-xl shadow-sm p-6">
        {!selectedNote ? (
          <div className="text-gray-500 text-center mt-20">
            Select a note from the left to view details
          </div>
        ) : (
          <div>
            <div className="flex gap-3 mb-4">
              <button
                onClick={generatePDF}
                className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                <FaFilePdf /> Download PDF
              </button>

              <button
                onClick={() => sendOnWhatsApp(selectedNote)}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                <FaWhatsapp /> Send via WhatsApp
              </button>
            </div>

            <div id="note-print-area">
              <h2 className="text-xl font-semibold text-gray-900">
                {selectedNote.patientName}
              </h2>
              <p className="text-sm text-gray-500 mb-6">
                {formatDateTime(selectedNote.createdAt)}
              </p>

              <div className="space-y-5 text-sm">
                <div>
                  <div className="font-semibold text-gray-700">Contact</div>
                  <div>Phone: {selectedNote.phone || "-"}</div>
                  <div>
                    Age / Gender: {selectedNote.age || "-"} /{" "}
                    {selectedNote.gender || "-"}
                  </div>
                </div>

                <div>
                  <div className="font-semibold text-gray-700">Symptoms</div>
                  <div className="whitespace-pre-line">
                    {selectedNote.symptoms || "-"}
                  </div>
                </div>

                <div>
                  <div className="font-semibold text-gray-700">Diagnosis</div>
                  <div className="whitespace-pre-line">
                    {selectedNote.diagnosis || "-"}
                  </div>
                </div>

                <div>
                  <div className="font-semibold text-gray-700">Medicines</div>
                  {selectedNote.medicines?.filter(
                    (m) => m.name || formatMedicine(m)
                  ).length ? (
                    <ul className="list-disc ml-5">
                      {selectedNote.medicines
                        .filter((m) => m.name || formatMedicine(m))
                        .map((m, i) => (
                          <li key={i}>
                            {m.name}
                            {formatMedicine(m) && <> — {formatMedicine(m)}</>}
                          </li>
                        ))}
                    </ul>
                  ) : (
                    <div>-</div>
                  )}
                </div>

                <div>
                  <div className="font-semibold text-gray-700">Lab Tests</div>
                  {selectedNote.labTests?.filter((t) => t.name).length ? (
                    <ul className="list-disc ml-5">
                      {selectedNote.labTests
                        .filter((t) => t.name)
                        .map((t, i) => (
                          <li key={i}>{t.name}</li>
                        ))}
                    </ul>
                  ) : (
                    <div>-</div>
                  )}
                </div>

                <div>
                  <div className="font-semibold text-gray-700">
                    IPD Instructions / Advice
                  </div>
                  <div className="whitespace-pre-line">
                    {selectedNote.ipdAdvice || "-"}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
