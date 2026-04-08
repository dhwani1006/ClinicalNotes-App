import mongoose from "mongoose";

const MedicineSchema = new mongoose.Schema({
  name: String,
  dose: String,
  frequency: String,
  duration: String,
  instructions: String,
});

const LabTestSchema = new mongoose.Schema({
  name: String,
});

const NoteSchema = new mongoose.Schema(
  {
    // 👇 Link each note to a user (doctor)
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    patientName: String,
    phone: String,
    age: String,
    gender: String,
    symptoms: String,
    diagnosis: String,
    ipdAdvice: String,
    medicines: [MedicineSchema],
    labTests: [LabTestSchema],
  },
  { timestamps: true }
);

const Note = mongoose.model("Note", NoteSchema);
export default Note;

