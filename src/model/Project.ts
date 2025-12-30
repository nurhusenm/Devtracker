import mongoose, {Schema, Document} from 'mongoose';

export  interface Iproject extends Document {
  name: string,
  description: string,
  status: 'active' | 'completed' | 'archived',
  createdAt: Date

}

const projectSchema: Schema = new Schema({
  name: {type: String, required: true},
  description: {type: String, required: true},
  status: {type: String,
     enum: ['active', 'completed', 'archived'],
      deafult: 'active'},
  xreatedAt: {type: Date, default: Date.now}

})

export default mongoose.model<Iproject>('project', projectSchema)
