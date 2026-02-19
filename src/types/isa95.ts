// ISA-95 Standard Manufacturing Data Models
// Based on ANSI/ISA-95.00.01-2010 (IEC 62264-1 Mod)

// ============================================================================
// ISA-95 Level 3 (MES) - Manufacturing Operations Management
// ============================================================================

export const MOMActivity = {
  PRODUCTION: 'PRODUCTION',
  QUALITY: 'QUALITY',
  MAINTENANCE: 'MAINTENANCE',
  INVENTORY: 'INVENTORY',
} as const;

export type MOMActivity = typeof MOMActivity[keyof typeof MOMActivity];

export const EquipmentHierarchyLevel = {
  ENTERPRISE: 0,
  SITE: 1,
  AREA: 2,
  PROCESS_CELL: 3,
  UNIT: 4,
  EQUIPMENT_MODULE: 5,
  CONTROL_MODULE: 6,
} as const;

export type EquipmentHierarchyLevel = typeof EquipmentHierarchyLevel[keyof typeof EquipmentHierarchyLevel];

// ============================================================================
// ISA-95 Resources
// ============================================================================

export interface Personnel {
  id: string;
  personnelId: string;
  name: string;
  role: string;
  qualification: string[];
  shift: string;
  status: 'ACTIVE' | 'INACTIVE' | 'OFFLINE';
  lastLogin: Date;
  skills: Skill[];
}

export interface Skill {
  id: string;
  name: string;
  level: 'BASIC' | 'INTERMEDIATE' | 'ADVANCED' | 'EXPERT';
  certified: boolean;
  certificationDate?: Date;
  expirationDate?: Date;
}

export const EquipmentStatus = {
  RUNNING: 'RUNNING',
  IDLE: 'IDLE',
  STOPPED: 'STOPPED',
  MAINTENANCE: 'MAINTENANCE',
  SETUP: 'SETUP',
  OFFLINE: 'OFFLINE',
  ERROR: 'ERROR',
} as const;

export type EquipmentStatus = typeof EquipmentStatus[keyof typeof EquipmentStatus];

export interface Equipment {
  id: string;
  equipmentId: string;
  name: string;
  description: string;
  hierarchyLevel: number;
  parentEquipmentId?: string;
  location: string;
  status: EquipmentStatus;
  oee: OEEMetrics;
  capabilities: EquipmentCapability[];
  maintenanceSchedule: MaintenanceSchedule[];
  lastMaintenance: Date;
  nextMaintenance: Date;
  parameters: EquipmentParameter[];
}

export interface OEEMetrics {
  availability: number;
  performance: number;
  quality: number;
  oee: number;
  calculatedAt: Date;
}

export interface EquipmentCapability {
  id: string;
  operationType: string;
  capacity: number;
  unit: string;
  setupTime: number;
  cycleTime: number;
}

export interface EquipmentParameter {
  id: string;
  name: string;
  value: number;
  unit: string;
  timestamp: Date;
  minValue?: number;
  maxValue?: number;
  alarmStatus?: 'NORMAL' | 'WARNING' | 'CRITICAL';
}

export interface Material {
  id: string;
  materialId: string;
  name: string;
  description: string;
  type: 'RAW' | 'WIP' | 'FINISHED' | 'CONSUMABLE';
  unit: string;
  batchNumber?: string;
  lotNumber?: string;
  quantity: number;
  location: string;
  qualityStatus: 'PENDING' | 'PASSED' | 'FAILED' | 'QUARANTINE';
  expiryDate?: Date;
  traceability: TraceabilityRecord[];
}

export interface TraceabilityRecord {
  id: string;
  timestamp: Date;
  operation: string;
  equipmentId?: string;
  personnelId?: string;
  quantity: number;
  parameters: Record<string, number>;
}

// ============================================================================
// ISA-95 Operations Definition
// ============================================================================

export interface ProductDefinition {
  id: string;
  productId: string;
  name: string;
  description: string;
  version: string;
  billOfMaterials: BOMItem[];
  routing: OperationStep[];
  qualityParameters: ProcessParameter[];
  cycleTime: number;
  targetOEE: number;
}

export interface BOMItem {
  id: string;
  materialId: string;
  quantity: number;
  unit: string;
  isCritical: boolean;
  alternativeMaterials?: string[];
}

export interface OperationStep {
  id: string;
  sequence: number;
  name: string;
  description: string;
  equipmentRequired: string[];
  setupTime: number;
  cycleTime: number;
  parameters: ProcessParameter[];
  qualityChecks: QualityCheckPoint[];
}

export interface ProcessParameter {
  id: string;
  name: string;
  targetValue: number;
  minValue: number;
  maxValue: number;
  unit: string;
  isCritical: boolean;
}

export interface QualityCheckPoint {
  id: string;
  name: string;
  type: 'VISUAL' | 'MEASUREMENT' | 'TEST';
  frequency: number;
  acceptanceCriteria: string;
}

// ============================================================================
// ISA-95 Operations Schedule
// ============================================================================

export const ScheduleStatus = {
  PLANNED: 'PLANNED',
  RELEASED: 'RELEASED',
  IN_PROGRESS: 'IN_PROGRESS',
  COMPLETED: 'COMPLETED',
  CANCELLED: 'CANCELLED',
  DELAYED: 'DELAYED',
} as const;

export type ScheduleStatus = typeof ScheduleStatus[keyof typeof ScheduleStatus];

export interface ProductionSchedule {
  id: string;
  scheduleId: string;
  productId: string;
  workOrderId: string;
  quantity: number;
  priority: number;
  startTime: Date;
  endTime: Date;
  equipmentId: string;
  personnelId: string[];
  status: ScheduleStatus;
  actualStart?: Date;
  actualEnd?: Date;
  actualQuantity?: number;
}

export const WorkOrderStatus = {
  CREATED: 'CREATED',
  RELEASED: 'RELEASED',
  IN_PROGRESS: 'IN_PROGRESS',
  COMPLETED: 'COMPLETED',
  CLOSED: 'CLOSED',
} as const;

export type WorkOrderStatus = typeof WorkOrderStatus[keyof typeof WorkOrderStatus];

export interface WorkOrder {
  id: string;
  workOrderId: string;
  productId: string;
  quantity: number;
  dueDate: Date;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  status: WorkOrderStatus;
  scheduleId?: string;
  createdAt: Date;
  releasedAt?: Date;
  completedAt?: Date;
}

// ============================================================================
// ISA-95 Operations Performance
// ============================================================================

export interface ProductionPerformance {
  id: string;
  workOrderId: string;
  scheduleId: string;
  equipmentId: string;
  personnelId: string;
  startTime: Date;
  endTime?: Date;
  quantityProduced: number;
  quantityRejected: number;
  parameters: ProcessParameterValue[];
  events: ProductionEvent[];
}

export interface ProcessParameterValue {
  parameterId: string;
  name: string;
  targetValue: number;
  actualValue: number;
  unit: string;
  timestamp: Date;
  isInSpec: boolean;
}

export const EventType = {
  START: 'START',
  STOP: 'STOP',
  PAUSE: 'PAUSE',
  RESUME: 'RESUME',
  SETUP: 'SETUP',
  CHANGEOVER: 'CHANGEOVER',
  BREAKDOWN: 'BREAKDOWN',
  QUALITY_CHECK: 'QUALITY_CHECK',
  PARAMETER_CHANGE: 'PARAMETER_CHANGE',
  ALARM: 'ALARM',
} as const;

export type EventType = typeof EventType[keyof typeof EventType];

export interface ProductionEvent {
  id: string;
  timestamp: Date;
  type: EventType;
  description: string;
  duration?: number;
  severity: 'INFO' | 'WARNING' | 'ERROR' | 'CRITICAL';
  relatedEntityId?: string;
}

// ============================================================================
// Quality Management
// ============================================================================

export interface QualityRecord {
  id: string;
  workOrderId: string;
  productId: string;
  inspectionType: 'IN_PROCESS' | 'FINAL' | 'RECEIVING' | 'INCOMING';
  inspectedBy: string;
  inspectedAt: Date;
  results: QualityResult[];
  overallResult: 'PASS' | 'FAIL' | 'PENDING';
  nonConformances: NonConformance[];
}

export interface QualityResult {
  id: string;
  parameterId: string;
  name: string;
  specification: string;
  measuredValue: number;
  unit: string;
  result: 'PASS' | 'FAIL';
}

export interface NonConformance {
  id: string;
  description: string;
  severity: 'MINOR' | 'MAJOR' | 'CRITICAL';
  quantityAffected: number;
  disposition: 'REWORK' | 'SCRAP' | 'USE_AS_IS' | 'RETURN';
  rootCause?: string;
  correctiveAction?: string;
}

// ============================================================================
// Maintenance Management
// ============================================================================

export interface MaintenanceSchedule {
  id: string;
  equipmentId: string;
  type: 'PREVENTIVE' | 'PREDICTIVE' | 'CORRECTIVE';
  frequency: number;
  frequencyUnit: 'HOURS' | 'DAYS' | 'CYCLES';
  lastPerformed?: Date;
  nextDue: Date;
  tasks: MaintenanceTask[];
}

export interface MaintenanceTask {
  id: string;
  description: string;
  estimatedDuration: number;
  requiredSkills: string[];
  requiredParts: string[];
  instructions: string;
}

export interface MaintenanceRecord {
  id: string;
  equipmentId: string;
  scheduleId: string;
  performedBy: string;
  startedAt: Date;
  completedAt?: Date;
  tasksCompleted: string[];
  partsUsed: string[];
  notes: string;
  equipmentStatus: 'OPERATIONAL' | 'DEGRADED' | 'REPAIR_NEEDED';
}

// ============================================================================
// Inventory Management
// ============================================================================

export interface InventoryRecord {
  id: string;
  materialId: string;
  location: string;
  quantity: number;
  unit: string;
  batchNumber?: string;
  receivedDate: Date;
  lastMoved: Date;
  status: 'AVAILABLE' | 'RESERVED' | 'QUARANTINE' | 'EXPIRED';
  movements: InventoryMovement[];
}

export interface InventoryMovement {
  id: string;
  timestamp: Date;
  type: 'RECEIPT' | 'ISSUE' | 'TRANSFER' | 'ADJUSTMENT' | 'CONSUMPTION';
  quantity: number;
  fromLocation?: string;
  toLocation?: string;
  referenceDocument?: string;
  performedBy: string;
}

// ============================================================================
// Time Series Data (for IoT/SCADA integration)
// ============================================================================

export interface TimeSeriesPoint {
  timestamp: Date;
  tagName: string;
  value: number;
  quality: 'GOOD' | 'UNCERTAIN' | 'BAD';
  equipmentId: string;
}

export interface TimeSeriesBatch {
  equipmentId: string;
  parameterName: string;
  startTime: Date;
  endTime: Date;
  interval: number;
  points: TimeSeriesPoint[];
}

// ============================================================================
// AI Agent System Types
// ============================================================================

export const AgentType = {
  SCHEDULER: 'SCHEDULER',
  QUALITY_INSPECTOR: 'QUALITY_INSPECTOR',
  MAINTENANCE_PREDICTOR: 'MAINTENANCE_PREDICTOR',
  INVENTORY_OPTIMIZER: 'INVENTORY_OPTIMIZER',
  PROCESS_OPTIMIZER: 'PROCESS_OPTIMIZER',
  ANOMALY_DETECTOR: 'ANOMALY_DETECTOR',
  DEMAND_FORECASTER: 'DEMAND_FORECASTER',
} as const;

export type AgentType = typeof AgentType[keyof typeof AgentType];

export const AgentStatus = {
  IDLE: 'IDLE',
  RUNNING: 'RUNNING',
  LEARNING: 'LEARNING',
  ERROR: 'ERROR',
  DISABLED: 'DISABLED',
} as const;

export type AgentStatus = typeof AgentStatus[keyof typeof AgentStatus];

export interface AIAgent {
  id: string;
  name: string;
  type: AgentType;
  status: AgentStatus;
  capabilities: string[];
  assignedEquipment?: string[];
  assignedProcesses?: string[];
  lastAction?: AgentAction;
  performance: AgentPerformance;
  configuration: AgentConfiguration;
}

export interface AgentAction {
  id: string;
  timestamp: Date;
  type: string;
  description: string;
  result: 'SUCCESS' | 'FAILURE' | 'PENDING';
  confidence: number;
  metadata: Record<string, any>;
}

export interface AgentPerformance {
  totalActions: number;
  successfulActions: number;
  averageConfidence: number;
  lastTrainingDate?: Date;
  accuracy: number;
}

export interface AgentConfiguration {
  autoExecute: boolean;
  confidenceThreshold: number;
  notificationEnabled: boolean;
  learningMode: 'SUPERVISED' | 'UNSUPERVISED' | 'REINFORCEMENT';
  schedule: string;
}

// ============================================================================
// Batch Job Processing Types
// ============================================================================

export const BatchJobType = {
  DATA_AGGREGATION: 'DATA_AGGREGATION',
  OEE_CALCULATION: 'OEE_CALCULATION',
  QUALITY_REPORT: 'QUALITY_REPORT',
  INVENTORY_RECONCILE: 'INVENTORY_RECONCILE',
  PREDICTIVE_MAINTENANCE: 'PREDICTIVE_MAINTENANCE',
  DEMAND_FORECAST: 'DEMAND_FORECAST',
  DATA_ARCHIVAL: 'DATA_ARCHIVAL',
  ANOMALY_DETECTION: 'ANOMALY_DETECTION',
} as const;

export type BatchJobType = typeof BatchJobType[keyof typeof BatchJobType];

export const BatchJobStatus = {
  SCHEDULED: 'SCHEDULED',
  RUNNING: 'RUNNING',
  COMPLETED: 'COMPLETED',
  FAILED: 'FAILED',
  PAUSED: 'PAUSED',
} as const;

export type BatchJobStatus = typeof BatchJobStatus[keyof typeof BatchJobStatus];

export interface BatchJob {
  id: string;
  name: string;
  type: BatchJobType;
  status: BatchJobStatus;
  schedule: string;
  lastRun?: Date;
  nextRun?: Date;
  lastResult?: BatchJobResult;
  configuration: Record<string, any>;
  priority: number;
}

export interface BatchJobResult {
  jobId: string;
  startedAt: Date;
  completedAt: Date;
  status: 'SUCCESS' | 'FAILURE' | 'PARTIAL';
  recordsProcessed: number;
  errors: string[];
  output: Record<string, any>;
}

// ============================================================================
// Dashboard and Analytics Types
// ============================================================================

export interface DashboardWidget {
  id: string;
  type: 'CHART' | 'METRIC' | 'TABLE' | 'GAUGE' | 'ALERT';
  title: string;
  dataSource: string;
  refreshInterval: number;
  configuration: Record<string, any>;
}

export interface ProductionMetric {
  name: string;
  value: number;
  unit: string;
  trend: 'UP' | 'DOWN' | 'STABLE';
  changePercent: number;
  timestamp: Date;
}

export interface Alert {
  id: string;
  severity: 'INFO' | 'WARNING' | 'ERROR' | 'CRITICAL';
  message: string;
  source: string;
  timestamp: Date;
  acknowledged: boolean;
  acknowledgedBy?: string;
  acknowledgedAt?: Date;
}
