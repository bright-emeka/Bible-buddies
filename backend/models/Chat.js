import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema({
  role: { type: String, enum: ['user', 'assistant'], required: true },
  content: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
}, { _id: false });

const chatSchema = new mongoose.Schema({
  userId: { type: String, ref: 'User', required: true, unique: true },
  messages: { type: [messageSchema], default: [] },
  updatedAt: { type: Date, default: Date.now },
}, {
  collection: 'chats',
});

chatSchema.pre('save', function (next) {
  this.updatedAt = new Date();
  next();
});

const Chat = mongoose.models.Chat || mongoose.model('Chat', chatSchema);
export default Chat;
