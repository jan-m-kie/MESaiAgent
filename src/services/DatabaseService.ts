// Database Services for AI-MES Platform
// Provides SQL (relational) and TimeSeries database abstractions

import type {
  Personnel,
  Equipment,
  Material,
  ProductDefinition,
  WorkOrder,
  ProductionSchedule,
  QualityRecord,
  MaintenanceRecord,
  InventoryRecord,
  TimeSeriesPoint,
  TimeSeriesBatch,
  BatchJob,
  BatchJobResult,
  Alert,
} from '@/types/isa95';
import { EquipmentStatus, WorkOrderStatus } from '@/types/isa95';

// ============================================================================
// SQL Database Service (Relational Data)
// ============================================================================

export class SQLDatabaseService {
  private static instance: SQLDatabaseService;
  
  // In-memory storage for demo (replace with actual SQL database)
  private storage = {
    personnel: new Map<string, Personnel>(),
    equipment: new Map<string, Equipment>(),
    materials: new Map<string, Material>(),
    products: new Map<string, ProductDefinition>(),
    workOrders: new Map<string, WorkOrder>(),
    schedules: new Map<string, ProductionSchedule>(),
    qualityRecords: new Map<string, QualityRecord>(),
    maintenanceRecords: new Map<string, MaintenanceRecord>(),
    inventory: new Map<string, InventoryRecord>(),
    batchJobs: new Map<string, BatchJob>(),
    batchJobResults: new Map<string, BatchJobResult>(),
    alerts: new Map<string, Alert>(),
  };

  private constructor() {}

  public static getInstance(): SQLDatabaseService {
    if (!SQLDatabaseService.instance) {
      SQLDatabaseService.instance = new SQLDatabaseService();
    }
    return SQLDatabaseService.instance;
  }

  public async connect(): Promise<void> {
    console.log('[SQLDB] Connecting to relational database...');
    
    // Simulate connection
    await new Promise(resolve => setTimeout(resolve, 100));
    
    console.log('[SQLDB] Connected successfully');
    
    // Initialize with sample data
    await this.initializeSampleData();
  }

  public async disconnect(): Promise<void> {
    console.log('[SQLDB] Disconnecting...');
  }

  // ==========================================================================
  // Personnel Operations
  // ==========================================================================

  public async createPersonnel(personnel: Personnel): Promise<Personnel> {
    this.storage.personnel.set(personnel.id, personnel);
    return personnel;
  }

  public async getPersonnel(id: string): Promise<Personnel | undefined> {
    return this.storage.personnel.get(id);
  }

  public async getAllPersonnel(): Promise<Personnel[]> {
    return Array.from(this.storage.personnel.values());
  }

  public async updatePersonnel(id: string, updates: Partial<Personnel>): Promise<Personnel | undefined> {
    const personnel = this.storage.personnel.get(id);
    if (personnel) {
      const updated = { ...personnel, ...updates };
      this.storage.personnel.set(id, updated);
      return updated;
    }
    return undefined;
  }

  public async deletePersonnel(id: string): Promise<boolean> {
    return this.storage.personnel.delete(id);
  }

  // ==========================================================================
  // Equipment Operations
  // ==========================================================================

  public async createEquipment(equipment: Equipment): Promise<Equipment> {
    this.storage.equipment.set(equipment.id, equipment);
    return equipment;
  }

  public async getEquipment(id: string): Promise<Equipment | undefined> {
    return this.storage.equipment.get(id);
  }

  public async getAllEquipment(): Promise<Equipment[]> {
    return Array.from(this.storage.equipment.values());
  }

  public async getEquipmentByStatus(status: string): Promise<Equipment[]> {
    return Array.from(this.storage.equipment.values())
      .filter(e => e.status === status);
  }

  public async updateEquipment(id: string, updates: Partial<Equipment>): Promise<Equipment | undefined> {
    const equipment = this.storage.equipment.get(id);
    if (equipment) {
      const updated = { ...equipment, ...updates };
      this.storage.equipment.set(id, updated);
      return updated;
    }
    return undefined;
  }

  public async deleteEquipment(id: string): Promise<boolean> {
    return this.storage.equipment.delete(id);
  }

  // ==========================================================================
  // Material Operations
  // ==========================================================================

  public async createMaterial(material: Material): Promise<Material> {
    this.storage.materials.set(material.id, material);
    return material;
  }

  public async getMaterial(id: string): Promise<Material | undefined> {
    return this.storage.materials.get(id);
  }

  public async getAllMaterials(): Promise<Material[]> {
    return Array.from(this.storage.materials.values());
  }

  public async getMaterialsByType(type: string): Promise<Material[]> {
    return Array.from(this.storage.materials.values())
      .filter(m => m.type === type);
  }

  public async updateMaterial(id: string, updates: Partial<Material>): Promise<Material | undefined> {
    const material = this.storage.materials.get(id);
    if (material) {
      const updated = { ...material, ...updates };
      this.storage.materials.set(id, updated);
      return updated;
    }
    return undefined;
  }

  // ==========================================================================
  // Product Definition Operations
  // ==========================================================================

  public async createProductDefinition(product: ProductDefinition): Promise<ProductDefinition> {
    this.storage.products.set(product.id, product);
    return product;
  }

  public async getProductDefinition(id: string): Promise<ProductDefinition | undefined> {
    return this.storage.products.get(id);
  }

  public async getAllProductDefinitions(): Promise<ProductDefinition[]> {
    return Array.from(this.storage.products.values());
  }

  // ==========================================================================
  // Work Order Operations
  // ==========================================================================

  public async createWorkOrder(workOrder: WorkOrder): Promise<WorkOrder> {
    this.storage.workOrders.set(workOrder.id, workOrder);
    return workOrder;
  }

  public async getWorkOrder(id: string): Promise<WorkOrder | undefined> {
    return this.storage.workOrders.get(id);
  }

  public async getAllWorkOrders(): Promise<WorkOrder[]> {
    return Array.from(this.storage.workOrders.values());
  }

  public async getWorkOrdersByStatus(status: string): Promise<WorkOrder[]> {
    return Array.from(this.storage.workOrders.values())
      .filter(wo => wo.status === status);
  }

  public async updateWorkOrder(id: string, updates: Partial<WorkOrder>): Promise<WorkOrder | undefined> {
    const workOrder = this.storage.workOrders.get(id);
    if (workOrder) {
      const updated = { ...workOrder, ...updates };
      this.storage.workOrders.set(id, updated);
      return updated;
    }
    return undefined;
  }

  // ==========================================================================
  // Production Schedule Operations
  // ==========================================================================

  public async createSchedule(schedule: ProductionSchedule): Promise<ProductionSchedule> {
    this.storage.schedules.set(schedule.id, schedule);
    return schedule;
  }

  public async getSchedule(id: string): Promise<ProductionSchedule | undefined> {
    return this.storage.schedules.get(id);
  }

  public async getAllSchedules(): Promise<ProductionSchedule[]> {
    return Array.from(this.storage.schedules.values());
  }

  public async getSchedulesByDateRange(start: Date, end: Date): Promise<ProductionSchedule[]> {
    return Array.from(this.storage.schedules.values())
      .filter(s => s.startTime >= start && s.endTime <= end);
  }

  public async updateSchedule(id: string, updates: Partial<ProductionSchedule>): Promise<ProductionSchedule | undefined> {
    const schedule = this.storage.schedules.get(id);
    if (schedule) {
      const updated = { ...schedule, ...updates };
      this.storage.schedules.set(id, updated);
      return updated;
    }
    return undefined;
  }

  // ==========================================================================
  // Quality Record Operations
  // ==========================================================================

  public async createQualityRecord(record: QualityRecord): Promise<QualityRecord> {
    this.storage.qualityRecords.set(record.id, record);
    return record;
  }

  public async getQualityRecord(id: string): Promise<QualityRecord | undefined> {
    return this.storage.qualityRecords.get(id);
  }

  public async getAllQualityRecords(): Promise<QualityRecord[]> {
    return Array.from(this.storage.qualityRecords.values());
  }

  public async getQualityRecordsByWorkOrder(workOrderId: string): Promise<QualityRecord[]> {
    return Array.from(this.storage.qualityRecords.values())
      .filter(qr => qr.workOrderId === workOrderId);
  }

  // ==========================================================================
  // Maintenance Record Operations
  // ==========================================================================

  public async createMaintenanceRecord(record: MaintenanceRecord): Promise<MaintenanceRecord> {
    this.storage.maintenanceRecords.set(record.id, record);
    return record;
  }

  public async getMaintenanceRecord(id: string): Promise<MaintenanceRecord | undefined> {
    return this.storage.maintenanceRecords.get(id);
  }

  public async getAllMaintenanceRecords(): Promise<MaintenanceRecord[]> {
    return Array.from(this.storage.maintenanceRecords.values());
  }

  public async getMaintenanceRecordsByEquipment(equipmentId: string): Promise<MaintenanceRecord[]> {
    return Array.from(this.storage.maintenanceRecords.values())
      .filter(mr => mr.equipmentId === equipmentId);
  }

  // ==========================================================================
  // Inventory Operations
  // ==========================================================================

  public async createInventoryRecord(record: InventoryRecord): Promise<InventoryRecord> {
    this.storage.inventory.set(record.id, record);
    return record;
  }

  public async getInventoryRecord(id: string): Promise<InventoryRecord | undefined> {
    return this.storage.inventory.get(id);
  }

  public async getAllInventoryRecords(): Promise<InventoryRecord[]> {
    return Array.from(this.storage.inventory.values());
  }

  public async getInventoryByMaterial(materialId: string): Promise<InventoryRecord[]> {
    return Array.from(this.storage.inventory.values())
      .filter(ir => ir.materialId === materialId);
  }

  public async updateInventoryRecord(id: string, updates: Partial<InventoryRecord>): Promise<InventoryRecord | undefined> {
    const record = this.storage.inventory.get(id);
    if (record) {
      const updated = { ...record, ...updates };
      this.storage.inventory.set(id, updated);
      return updated;
    }
    return undefined;
  }

  // ==========================================================================
  // Batch Job Operations
  // ==========================================================================

  public async createBatchJob(job: BatchJob): Promise<BatchJob> {
    this.storage.batchJobs.set(job.id, job);
    return job;
  }

  public async getBatchJob(id: string): Promise<BatchJob | undefined> {
    return this.storage.batchJobs.get(id);
  }

  public async getAllBatchJobs(): Promise<BatchJob[]> {
    return Array.from(this.storage.batchJobs.values());
  }

  public async updateBatchJob(id: string, updates: Partial<BatchJob>): Promise<BatchJob | undefined> {
    const job = this.storage.batchJobs.get(id);
    if (job) {
      const updated = { ...job, ...updates };
      this.storage.batchJobs.set(id, updated);
      return updated;
    }
    return undefined;
  }

  public async createBatchJobResult(result: BatchJobResult): Promise<BatchJobResult> {
    this.storage.batchJobResults.set(result.jobId, result);
    return result;
  }

  public async getBatchJobResults(jobId: string): Promise<BatchJobResult | undefined> {
    return this.storage.batchJobResults.get(jobId);
  }

  // ==========================================================================
  // Alert Operations
  // ==========================================================================

  public async createAlert(alert: Alert): Promise<Alert> {
    this.storage.alerts.set(alert.id, alert);
    return alert;
  }

  public async getAlert(id: string): Promise<Alert | undefined> {
    return this.storage.alerts.get(id);
  }

  public async getAllAlerts(): Promise<Alert[]> {
    return Array.from(this.storage.alerts.values());
  }

  public async getUnacknowledgedAlerts(): Promise<Alert[]> {
    return Array.from(this.storage.alerts.values())
      .filter(a => !a.acknowledged);
  }

  public async updateAlert(id: string, updates: Partial<Alert>): Promise<Alert | undefined> {
    const alert = this.storage.alerts.get(id);
    if (alert) {
      const updated = { ...alert, ...updates };
      this.storage.alerts.set(id, updated);
      return updated;
    }
    return undefined;
  }

  // ==========================================================================
  // Transaction Support
  // ==========================================================================

  public async beginTransaction(): Promise<string> {
    const txId = `tx-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    console.log(`[SQLDB] Transaction started: ${txId}`);
    return txId;
  }

  public async commitTransaction(txId: string): Promise<void> {
    console.log(`[SQLDB] Transaction committed: ${txId}`);
  }

  public async rollbackTransaction(txId: string): Promise<void> {
    console.log(`[SQLDB] Transaction rolled back: ${txId}`);
  }

  // ==========================================================================
  // Sample Data Initialization
  // ==========================================================================

  private async initializeSampleData(): Promise<void> {
    console.log('[SQLDB] Initializing sample data...');

    // Sample Equipment
    const equipment1: Equipment = {
      id: 'eq-001',
      equipmentId: 'CNC-001',
      name: 'CNC Machine Alpha',
      description: '5-Axis CNC Machining Center',
      hierarchyLevel: 4,
      location: 'Building A - Line 1',
      status: EquipmentStatus.RUNNING,
      oee: {
        availability: 92,
        performance: 88,
        quality: 98,
        oee: 79.5,
        calculatedAt: new Date(),
      },
      capabilities: [
        {
          id: 'cap-001',
          operationType: 'MILLING',
          capacity: 100,
          unit: 'parts/hour',
          setupTime: 30,
          cycleTime: 6,
        },
      ],
      maintenanceSchedule: [],
      lastMaintenance: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      nextMaintenance: new Date(Date.now() + 23 * 24 * 60 * 60 * 1000),
      parameters: [],
    };

    const equipment2: Equipment = {
      id: 'eq-002',
      equipmentId: 'ROB-001',
      name: 'Assembly Robot Beta',
      description: '6-DOF Industrial Robot',
      hierarchyLevel: 5,
      parentEquipmentId: 'eq-001',
      location: 'Building A - Line 1',
      status: EquipmentStatus.RUNNING,
      oee: {
        availability: 95,
        performance: 92,
        quality: 99,
        oee: 86.5,
        calculatedAt: new Date(),
      },
      capabilities: [],
      maintenanceSchedule: [],
      lastMaintenance: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
      nextMaintenance: new Date(Date.now() + 16 * 24 * 60 * 60 * 1000),
      parameters: [],
    };

    await this.createEquipment(equipment1);
    await this.createEquipment(equipment2);

    // Sample Personnel
    const personnel1: Personnel = {
      id: 'per-001',
      personnelId: 'EMP-001',
      name: 'John Smith',
      role: 'Machine Operator',
      qualification: ['CNC Operation', 'Quality Inspection'],
      shift: 'Morning',
      status: 'ACTIVE',
      lastLogin: new Date(),
      skills: [
        { id: 'skill-001', name: 'CNC Programming', level: 'ADVANCED', certified: true },
        { id: 'skill-002', name: 'Quality Control', level: 'INTERMEDIATE', certified: true },
      ],
    };

    await this.createPersonnel(personnel1);

    // Sample Work Orders
    const workOrder1: WorkOrder = {
      id: 'wo-001',
      workOrderId: 'WO-2024-001',
      productId: 'PROD-001',
      quantity: 1000,
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      priority: 'HIGH',
      status: WorkOrderStatus.IN_PROGRESS,
      createdAt: new Date(),
      releasedAt: new Date(),
    };

    await this.createWorkOrder(workOrder1);

    // Sample Materials
    const material1: Material = {
      id: 'mat-001',
      materialId: 'RAW-AL-001',
      name: 'Aluminum Bar Stock',
      description: '6061-T6 Aluminum',
      type: 'RAW',
      unit: 'kg',
      quantity: 5000,
      location: 'Warehouse A',
      qualityStatus: 'PASSED',
      traceability: [],
    };

    await this.createMaterial(material1);

    console.log('[SQLDB] Sample data initialized');
  }
}

// ============================================================================
// TimeSeries Database Service (Industrial IoT Data)
// ============================================================================

export class TimeSeriesDatabaseService {
  private static instance: TimeSeriesDatabaseService;
  
  // In-memory storage for demo (replace with InfluxDB/TimescaleDB)
  private timeSeriesData: Map<string, TimeSeriesPoint[]> = new Map();

  private constructor() {}

  public static getInstance(): TimeSeriesDatabaseService {
    if (!TimeSeriesDatabaseService.instance) {
      TimeSeriesDatabaseService.instance = new TimeSeriesDatabaseService();
    }
    return TimeSeriesDatabaseService.instance;
  }

  public async connect(): Promise<void> {
    console.log('[TSDB] Connecting to time-series database...');
    
    // Simulate connection
    await new Promise(resolve => setTimeout(resolve, 100));
    
    console.log('[TSDB] Connected successfully');
    
    // Start data simulation
    this.startDataSimulation();
  }

  public async disconnect(): Promise<void> {
    console.log('[TSDB] Disconnecting...');
  }

  // ==========================================================================
  // Data Ingestion
  // ==========================================================================

  public async writePoint(point: TimeSeriesPoint): Promise<void> {
    const key = `${point.equipmentId}.${point.tagName}`;
    
    if (!this.timeSeriesData.has(key)) {
      this.timeSeriesData.set(key, []);
    }
    
    const series = this.timeSeriesData.get(key)!;
    series.push(point);
    
    // Keep only last 24 hours of data in memory
    const cutoff = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const filtered = series.filter(p => p.timestamp > cutoff);
    this.timeSeriesData.set(key, filtered);
  }

  public async writeBatch(batch: TimeSeriesBatch): Promise<void> {
    for (const point of batch.points) {
      await this.writePoint(point);
    }
  }

  // ==========================================================================
  // Data Querying
  // ==========================================================================

  public async query(
    equipmentId: string,
    tagName: string,
    startTime: Date,
    endTime: Date,
    aggregation?: 'mean' | 'min' | 'max' | 'sum' | 'count'
  ): Promise<TimeSeriesPoint[]> {
    const key = `${equipmentId}.${tagName}`;
    const series = this.timeSeriesData.get(key) || [];
    
    const filtered = series.filter(
      p => p.timestamp >= startTime && p.timestamp <= endTime
    );

    if (aggregation) {
      return this.aggregatePoints(filtered, aggregation);
    }

    return filtered;
  }

  public async queryLatest(
    equipmentId: string,
    tagName: string
  ): Promise<TimeSeriesPoint | undefined> {
    const key = `${equipmentId}.${tagName}`;
    const series = this.timeSeriesData.get(key) || [];
    
    if (series.length === 0) return undefined;
    
    return series[series.length - 1];
  }

  public async queryMultiple(
    queries: Array<{
      equipmentId: string;
      tagName: string;
      startTime: Date;
      endTime: Date;
    }>
  ): Promise<Map<string, TimeSeriesPoint[]>> {
    const results = new Map<string, TimeSeriesPoint[]>();
    
    for (const query of queries) {
      const key = `${query.equipmentId}.${query.tagName}`;
      const points = await this.query(
        query.equipmentId,
        query.tagName,
        query.startTime,
        query.endTime
      );
      results.set(key, points);
    }
    
    return results;
  }

  // ==========================================================================
  // Aggregation Functions
  // ==========================================================================

  private aggregatePoints(
    points: TimeSeriesPoint[],
    aggregation: 'mean' | 'min' | 'max' | 'sum' | 'count'
  ): TimeSeriesPoint[] {
    if (points.length === 0) return [];

    let aggregatedValue: number;

    switch (aggregation) {
      case 'mean':
        aggregatedValue = points.reduce((sum, p) => sum + p.value, 0) / points.length;
        break;
      case 'min':
        aggregatedValue = Math.min(...points.map(p => p.value));
        break;
      case 'max':
        aggregatedValue = Math.max(...points.map(p => p.value));
        break;
      case 'sum':
        aggregatedValue = points.reduce((sum, p) => sum + p.value, 0);
        break;
      case 'count':
        aggregatedValue = points.length;
        break;
      default:
        aggregatedValue = 0;
    }

    return [{
      timestamp: points[points.length - 1].timestamp,
      tagName: points[0].tagName,
      value: aggregatedValue,
      quality: 'GOOD',
      equipmentId: points[0].equipmentId,
    }];
  }

  public async downsample(
    equipmentId: string,
    tagName: string,
    interval: number,
    startTime: Date,
    endTime: Date
  ): Promise<TimeSeriesPoint[]> {
    const points = await this.query(equipmentId, tagName, startTime, endTime);
    
    if (points.length === 0) return [];

    const buckets = new Map<number, TimeSeriesPoint[]>();
    
    for (const point of points) {
      const bucketTime = Math.floor(point.timestamp.getTime() / (interval * 1000)) * (interval * 1000);
      
      if (!buckets.has(bucketTime)) {
        buckets.set(bucketTime, []);
      }
      
      buckets.get(bucketTime)!.push(point);
    }

    const downsampled: TimeSeriesPoint[] = [];
    
    for (const [bucketTime, bucketPoints] of buckets) {
      const avg = bucketPoints.reduce((sum, p) => sum + p.value, 0) / bucketPoints.length;
      downsampled.push({
        timestamp: new Date(bucketTime),
        tagName,
        value: avg,
        quality: 'GOOD',
        equipmentId,
      });
    }

    return downsampled.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
  }

  // ==========================================================================
  // Analytics Functions
  // ==========================================================================

  public async calculateStatistics(
    equipmentId: string,
    tagName: string,
    startTime: Date,
    endTime: Date
  ): Promise<{
    count: number;
    mean: number;
    min: number;
    max: number;
    stdDev: number;
  }> {
    const points = await this.query(equipmentId, tagName, startTime, endTime);
    
    if (points.length === 0) {
      return { count: 0, mean: 0, min: 0, max: 0, stdDev: 0 };
    }

    const values = points.map(p => p.value);
    const count = values.length;
    const mean = values.reduce((sum, v) => sum + v, 0) / count;
    const min = Math.min(...values);
    const max = Math.max(...values);
    
    const variance = values.reduce((sum, v) => sum + Math.pow(v - mean, 2), 0) / count;
    const stdDev = Math.sqrt(variance);

    return { count, mean, min, max, stdDev };
  }

  public async detectAnomalies(
    equipmentId: string,
    tagName: string,
    threshold: number = 3
  ): Promise<TimeSeriesPoint[]> {
    const endTime = new Date();
    const startTime = new Date(endTime.getTime() - 24 * 60 * 60 * 1000);
    
    const stats = await this.calculateStatistics(equipmentId, tagName, startTime, endTime);
    
    if (stats.count === 0) return [];

    const points = await this.query(equipmentId, tagName, startTime, endTime);
    
    return points.filter(p => {
      const zScore = Math.abs((p.value - stats.mean) / stats.stdDev);
      return zScore > threshold;
    });
  }

  // ==========================================================================
  // Data Simulation (for demo purposes)
  // ==========================================================================

  private startDataSimulation(): void {
    // Simulate sensor data every second
    setInterval(() => {
      this.simulateEquipmentData('eq-001');
      this.simulateEquipmentData('eq-002');
    }, 1000);
  }

  private simulateEquipmentData(equipmentId: string): void {
    const now = new Date();
    
    // Temperature
    this.writePoint({
      timestamp: now,
      tagName: 'temperature',
      value: 45 + Math.random() * 10,
      quality: 'GOOD',
      equipmentId,
    });
    
    // Vibration
    this.writePoint({
      timestamp: now,
      tagName: 'vibration',
      value: Math.random() * 5,
      quality: 'GOOD',
      equipmentId,
    });
    
    // Power
    this.writePoint({
      timestamp: now,
      tagName: 'power',
      value: 80 + Math.random() * 40,
      quality: 'GOOD',
      equipmentId,
    });
    
    // Speed
    this.writePoint({
      timestamp: now,
      tagName: 'speed',
      value: 1000 + Math.random() * 200,
      quality: 'GOOD',
      equipmentId,
    });
  }

  // ==========================================================================
  // Data Retention
  // ==========================================================================

  public async deleteOldData(olderThan: Date): Promise<number> {
    let deletedCount = 0;
    
    for (const [key, series] of this.timeSeriesData) {
      const originalLength = series.length;
      const filtered = series.filter(p => p.timestamp > olderThan);
      deletedCount += originalLength - filtered.length;
      this.timeSeriesData.set(key, filtered);
    }
    
    return deletedCount;
  }

  public async compactData(): Promise<void> {
    // Compact data by downsampling older data
    const now = new Date();
    const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    
    for (const [key, series] of this.timeSeriesData) {
      // Keep raw data for last hour
      const recentData = series.filter(p => p.timestamp > oneHourAgo);
      
      // Downsample data between 1 hour and 1 day
      const oldData = series.filter(p => p.timestamp <= oneHourAgo && p.timestamp > oneDayAgo);
      
      // Aggregate data older than 1 day (currently just keeping it in oldData)
      const oldDataWithAggregated = [...oldData, ...series.filter(p => p.timestamp <= oneDayAgo)];
      
      // TODO: Implement proper downsampling and aggregation
      this.timeSeriesData.set(key, [...recentData, ...oldDataWithAggregated]);
    }
  }
}

// Export singleton instances
export const sqlDB = SQLDatabaseService.getInstance();
export const tsDB = TimeSeriesDatabaseService.getInstance();
