import mongoose, {Schema, Document} from "mongoose";

export  interface ITask extends Document{
    title: string,
    description: string,
    status: 'todo' | 'inprogress' | 'done';
    projectId: mongoose.Types.ObjectId;
    dueDate?: Date;

}

const TaskSchema: Schema = new Schema({
    title: {type: String, required: true},
    description: {type: String, required: false},
    status: {type: String, enum: ['todo', 'in-progress', 'done'],
        default: 'todo'
    },
    projectId: {
        type: mongoose.Schema.Types.ObjectId,
         ref: 'project',
         required: true
        },

    dueDate: {type: Date}

})

export default mongoose.model<ITask>('Task', TaskSchema)