import mongoose from 'mongoose'

const TaskSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    subject: String,
    type: String,
    date: String,
    time: String,
    period: String,
    
    // ✅ Add status if not already in your actual model
    status: { 
      type: String, 
      enum: ['pending', 'completed', 'cancelled'],
      default: 'pending' 
    },

    // ✅ REMINDER TRACKING
    remindersSent: {
      type: [Number], // [60, 30, 10]
      default: [],
    },
    
    // ✅ Optional: Add user email reference
    userEmail: {
      type: String,
      required: false,
        default: 'shared',  // Or set a default

    },
  },
  { timestamps: true }
)

export default mongoose.models.Task ?? mongoose.model('Task', TaskSchema)
