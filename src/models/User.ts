import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    chatId: { type: String, required: true, unique: true },
    name:  {type: String, required: true},
    surname: {type: String, required: true},
    school: {type: String, required: true}
  });
  
  const User = mongoose.model("User", userSchema);
  
  export default User;

