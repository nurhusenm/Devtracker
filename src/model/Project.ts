import mongoose, {Schema, Document} from 'mongoose';

export  interface Iproject extends Document {
  name: string,
  description: string,
  status: 'active' | 'completed' | 'archived',
  createdAt: Date
  owner: mongoose.Types.ObjectId;

}

const projectSchema: Schema = new Schema({
  name: {type: String, required: true},
  description: {type: String, required: true},
  status: {type: String,
     enum: ['active', 'completed', 'archived'],
      deafult: 'active'},
  createdAt: {type: Date, default: Date.now},
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }

})

export default mongoose.model<Iproject>('project', projectSchema)
