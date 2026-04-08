import { useEffect, useState } from "react";

export default function NewNote() {
  const [form, setForm] = useState({
    patientName: "",
    phone: "",
    age: "",
    gender: "",
    symptoms: "",
    diagnosis: "",
    ipdAdvice: "",
  });

  const [medicines, setMedicines] = useState([
    { name: "", dose: "", frequency: "", duration: "", instructions: "" },
  ]);

  const [labTests, setLabTests] = useState([{ name: "" }]);

  const [ai, setAi] = useState({
    diagnosis: [],
    medicines: [],
    labTests: [],
    advice: [],
  });

  const [loadingAI, setLoadingAI] = useState(false);
  const [error, setError] = useState("");

  const [errors, setErrors] = useState({}); // ✅ validation errors

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  useEffect(() => {
    if (!form.symptoms || form.symptoms.trim().length < 3) return;

    const fetchAI = async () => {
      try {
        setLoadingAI(true);
        setError("");

        const res = await fetch(`${import.meta.env.VITE_API_URL}/api/ai/suggest`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ symptoms: form.symptoms }),
        });

        if (!res.ok) throw new Error("AI request failed");

        const data = await res.json();

        //Combine + dedupe AI results instead of replacing
        setAi((prev) => ({
          diagnosis: Array.from(
            new Set([...(prev.diagnosis || []), ...(data.diagnosis || [])])
          ),
          medicines: Array.from(
            new Set([...(prev.medicines || []), ...(data.medicines || [])])
          ),
          labTests: Array.from(
            new Set([...(prev.labTests || []), ...(data.labTests || [])])
          ),
          advice: Array.from(
            new Set([...(prev.advice || []), ...(data.advice || [])])
          ),
        }));
      } catch (err) {
        console.error(err);
        setError("Could not fetch AI suggestions.");
      } finally {
        setLoadingAI(false);
      }
    };

    const t = setTimeout(fetchAI, 600);
    return () => clearTimeout(t);
  }, [form.symptoms]);

  // -------- Save Note with VALIDATION --------
  const handleSave = async () => {
    const newErrors = {};

    if (!form.patientName.trim()) newErrors.patientName = "Patient name is required";
    if (!form.phone.trim()) newErrors.phone = "Phone number is required";
    if (!form.age.trim()) newErrors.age = "Age is required";
    if (!form.gender.trim()) newErrors.gender = "Gender is required";
    if (!form.symptoms.trim()) newErrors.symptoms = "Symptoms are required";
    if (!form.diagnosis.trim()) newErrors.diagnosis = "Diagnosis is required";
    if (!medicines[0].name.trim()) newErrors.medicine0 = "Medicine name is required";

    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) {
      return; // ❌ Stop if any validation error
    }

    try {
      const token = localStorage.getItem("token");

      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/notes`, {
        method: "POST",
        headers: { "Content-Type": "application/json", 
        Authorization: `Bearer ${token}`, 
        },
        body: JSON.stringify({
          ...form,
          medicines,
          labTests,
        }),
      });

      if (!res.ok) throw new Error("Failed to save note");

      alert("✅ Note saved successfully!");

      // ✅ Reset form after successful save
      setForm({
        patientName: "",
        phone: "",
        age: "",
        gender: "",
        symptoms: "",
        diagnosis: "",
        ipdAdvice: "",
      });

      setMedicines([
        { name: "", dose: "", frequency: "", duration: "", instructions: "" },
      ]);
      setLabTests([{ name: "" }]);
      setAi({ diagnosis: [], medicines: [], labTests: [], advice: [] });
      setErrors({});
    } catch (err) {
      console.error(err);
      alert("❌ Error saving note");
    }
  };

  // -------- Medicines helpers --------
  const addMedicine = (name = "") => {
    setMedicines((prev) => [
      ...prev,
      { name, dose: "", frequency: "", duration: "", instructions: "" },
    ]);
  };

  const removeMedicine = (index) => {
    setMedicines(medicines.filter((_, i) => i !== index));
  };

  const updateMedicine = (index, field, value) => {
    const updated = [...medicines];
    updated[index][field] = value;
    setMedicines(updated);
  };

  const addMedicineFromAI = (name) => {
    if (medicines.length === 1 && !medicines[0].name) {
      updateMedicine(0, "name", name);
    } else {
      addMedicine(name);
    }
  };

  // -------- Lab tests helpers --------
  const addLabTest = (name = "") => {
    setLabTests((prev) => [...prev, { name }]);
  };

  const removeLabTest = (index) => {
    setLabTests(labTests.filter((_, i) => i !== index));
  };

  const updateLabTest = (index, value) => {
    const updated = [...labTests];
    updated[index].name = value;
    setLabTests(updated);
  };

  const addLabFromAI = (name) => {
    if (labTests.length === 1 && !labTests[0].name) {
      updateLabTest(0, name);
    } else {
      addLabTest(name);
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-8">
      <div className="bg-white rounded-2xl shadow-sm p-8">
        <div className="mb-8">
          <h1 className="text-2xl font-semibold text-gray-900">
            Create New Clinical Note
          </h1>
          <p className="text-sm text-gray-500">
            Document patient consultation details clearly and securely.
          </p>
        </div>

        {/* Patient Details */}
        <div className="mb-10">
          <h2 className="text-base font-semibold text-gray-800 mb-4">
            Patient Details
          </h2>

          <div className="space-y-3">
            <div className="grid grid-cols-12 gap-4">
              <div className="col-span-6">
                <input
                  className="input-sm w-full"
                  name="patientName"
                  value={form.patientName}
                  onChange={handleChange}
                  placeholder="Patient Name"
                  autoComplete="off"
                />
                {errors.patientName && (
                  <div className="text-sm text-red-500 mt-1">{errors.patientName}</div>
                )}
              </div>

              <div className="col-span-6">
                <input
                  className="input-sm w-full"
                  name="phone"
                  value={form.phone}
                  onChange={handleChange}
                  placeholder="Phone Number"
                  autoComplete="off"
                />
                {errors.phone && (
                  <div className="text-sm text-red-500 mt-1">{errors.phone}</div>
                )}
              </div>
            </div>

            <div className="grid grid-cols-12 gap-4">
              <div className="col-span-6">
                <input
                  className="input-sm w-full"
                  name="age"
                  value={form.age}
                  onChange={handleChange}
                  placeholder="Age"
                  autoComplete="off"
                />
                {errors.age && (
                  <div className="text-sm text-red-500 mt-1">{errors.age}</div>
                )}
              </div>

              <div className="col-span-6">
                <select
                  className={`input-sm w-full ${
                    form.gender ? "text-gray-900" : "text-gray-400"
                  }`}
                  name="gender"
                  value={form.gender}
                  onChange={handleChange}
                >
                  <option value="">Gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
                {errors.gender && (
                  <div className="text-sm text-red-500 mt-1">{errors.gender}</div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Symptoms */}
        <div className="mb-10">
          <label className="label">Symptoms / Chief Complaints</label>
          <textarea
            className="input"
            rows={3}
            name="symptoms"
            value={form.symptoms}
            onChange={handleChange}
            placeholder="e.g., fever, cough, headache"
          />
          {errors.symptoms && (
            <div className="text-sm text-red-500 mt-1">{errors.symptoms}</div>
          )}
          {loadingAI && (
            <p className="text-sm text-blue-500 mt-2">Analyzing with AI...</p>
          )}
          {error && <p className="text-sm text-red-500 mt-2">{error}</p>}
        </div>

        {/* Diagnosis */}
        <div className="mb-10">
          <label className="label">Diagnosis</label>
          <textarea
            className="input"
            rows={2}
            name="diagnosis"
            value={form.diagnosis}
            onChange={handleChange}
            placeholder="e.g., Viral fever, Upper respiratory infection"
          />
          {errors.diagnosis && (
            <div className="text-sm text-red-500 mt-1">{errors.diagnosis}</div>
          )}
          <SuggestionChips
            items={ai.diagnosis}
            onPick={(v) =>
              setForm((p) => ({
                ...p,
                diagnosis: p.diagnosis ? p.diagnosis + "\n" + v : v,
              }))
            }
          />
        </div>

        {/* Medicines */}
        <div className="mb-10">
          <label className="label">Medicines</label>

          {medicines.map((m, i) => (
            <div key={i} className="mb-5">
              <div className="grid grid-cols-12 gap-3">
                <div className="col-span-6">
                  <input
                    className="input w-full"
                    placeholder="Medicine Name"
                    value={m.name}
                    onChange={(e) => updateMedicine(i, "name", e.target.value)}
                  />
                  {i === 0 && errors.medicine0 && (
                    <div className="text-sm text-red-500 mt-1">
                      {errors.medicine0}
                    </div>
                  )}
                </div>

                <input
                  className="input col-span-3"
                  placeholder="Dose (e.g. 1-0-1)"
                  value={m.dose}
                  onChange={(e) => updateMedicine(i, "dose", e.target.value)}
                />
                <input
                  className="input col-span-3"
                  placeholder="Frequency (Daily)"
                  value={m.frequency}
                  onChange={(e) => updateMedicine(i, "frequency", e.target.value)}
                />

                <input
                  className="input col-span-3"
                  placeholder="Duration (5 days)"
                  value={m.duration}
                  onChange={(e) => updateMedicine(i, "duration", e.target.value)}
                />
                <input
                  className="input col-span-9"
                  placeholder="Instructions (e.g. After food)"
                  value={m.instructions}
                  onChange={(e) =>
                    updateMedicine(i, "instructions", e.target.value)
                  }
                />
              </div>

              {i !== 0 && (
                <button
                  type="button"
                  onClick={() => removeMedicine(i)}
                  className="text-sm text-red-500 mt-1"
                >
                  Remove
                </button>
              )}
            </div>
          ))}

          <button
            type="button"
            onClick={() => addMedicine()}
            className="text-sm text-[#1877F2]"
          >
            + Add another medicine
          </button>

          <SuggestionChips
            items={ai.medicines}
            onPick={(v) => addMedicineFromAI(v)}
          />
        </div>

        {/* Lab Tests */}
        <div className="mb-10">
          <label className="label">Lab Tests</label>

          {labTests.map((t, i) => (
            <div key={i} className="mb-4">
              <input
                className="input w-full"
                placeholder="Lab Test Name (e.g. CBC)"
                value={t.name}
                onChange={(e) => updateLabTest(i, e.target.value)}
              />

              {i !== 0 && (
                <button
                  type="button"
                  onClick={() => removeLabTest(i)}
                  className="text-sm text-red-500 mt-1"
                >
                  Remove
                </button>
              )}
            </div>
          ))}

          <button
            type="button"
            onClick={() => addLabTest()}
            className="text-sm text-[#1877F2]"
          >
            + Add another lab test
          </button>

          <SuggestionChips
            items={ai.labTests}
            onPick={(v) => addLabFromAI(v)}
          />
        </div>

        {/* IPD Advice */}
        <div className="mb-10">
          <label className="label">IPD Instructions / Advice</label>
          <textarea
            className="input"
            rows={3}
            name="ipdAdvice"
            value={form.ipdAdvice}
            onChange={handleChange}
            placeholder="e.g., Start prescribed treatment, review after reports..."
          />
        </div>

        {/* Save */}
        <div className="flex justify-end">
          <button
            onClick={handleSave}
            className="px-6 py-3 rounded-xl bg-[#1877F2] text-white font-semibold hover:bg-[#1664d4]"
          >
            Save Note
          </button>
        </div>
      </div>

      <style>{`
        .input {
          width: 100%;
          padding: 12px 14px;
          border-radius: 12px;
          border: 1px solid #d1d5db;
          outline: none;
        }
        .input-sm {
          width: 100%;
          padding: 10px 12px;
          border-radius: 10px;
          border: 1px solid #d1d5db;
          outline: none;
        }
        .input:focus, .input-sm:focus {
          border-color: #1877F2;
          box-shadow: 0 0 0 2px rgba(24,119,242,0.2);
        }
        .label {
          display: block;
          font-size: 14px;
          font-weight: 600;
          color: #374151;
          margin-bottom: 6px;
        }
      `}</style>
    </div>
  );
}

function SuggestionChips({ items, onPick }) {
  if (!items || items.length === 0) return null;

  return (
    <div className="mt-2 flex flex-wrap gap-2">
      {items.map((s, i) => (
        <button
          key={i}
          type="button"
          onClick={() => onPick(s)}
          className="text-sm px-3 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-100 hover:bg-blue-100 flex items-center gap-1"
        >
          <span>✨</span>
          <span>{s}</span>
        </button>
      ))}
    </div>
  );
}
