import mongoose, { Schema, Document } from 'mongoose';

export interface IAuditLog extends Document {
  action: string;
  performedBy: mongoose.Types.ObjectId;
  role: string;
  targetResource?: string;
  targetId?: string;
  ipAddress?: string;
  details?: Record<string, any>;
  createdAt: Date;
}

const AuditLogSchema = new Schema<IAuditLog>({
  action: { type: String, required: true, index: true },
  performedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  role: { type: String, required: true },
  targetResource: { type: String },
  targetId: { type: String },
  ipAddress: { type: String },
  details: { type: Schema.Types.Mixed }
}, {
  timestamps: { createdAt: true, updatedAt: false }
});

export const AuditLog = mongoose.model<IAuditLog>('AuditLog', AuditLogSchema);
