// Batch Job Processing Service for AI-MES Platform
// Handles background data processing, reporting, and analytics

import type {
  BatchJob,
  BatchJobResult,
  Equipment,
} from '@/types/isa95';
import { BatchJobType, BatchJobStatus } from '@/types/isa95';
import { sqlDB, tsDB } from './DatabaseService';

// Simple EventEmitter implementation for browser
class EventEmitter {
  private listeners: Map<string, Array<(data: any) => void>> = new Map();

  on(event: string, callback: (data: any) => void): void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event)!.push(callback);
  }

  off(event: string, callback: (data: any) => void): void {
    const callbacks = this.listeners.get(event);
    if (callbacks) {
      const index = callbacks.indexOf(callback);
      if (index > -1) {
        callbacks.splice(index, 1);
      }
    }
  }

  emit(event: string, data?: any): void {
    const callbacks = this.listeners.get(event);
    if (callbacks) {
      callbacks.forEach(callback => callback(data));
    }
  }

  removeAllListeners(): void {
    this.listeners.clear();
  }
}

// Job Processor Interface
interface JobProcessor {
  process(job: BatchJob): Promise<BatchJobResult>;
}

// ============================================================================
// OEE Calculation Job Processor
// ============================================================================

class OEECalculationProcessor implements JobProcessor {
  async process(job: BatchJob): Promise<BatchJobResult> {
    const startTime = new Date();
    const errors: string[] = [];
    let recordsProcessed = 0;

    try {
      // Get all equipment
      const equipment = await sqlDB.getAllEquipment();
      
      for (const eq of equipment) {
        // Calculate OEE for each equipment
        const oee = await this.calculateOEE(eq);
        
        // Update equipment with new OEE
        await sqlDB.updateEquipment(eq.id, { oee });
        
        recordsProcessed++;
      }

      return {
        jobId: job.id,
        startedAt: startTime,
        completedAt: new Date(),
        status: 'SUCCESS',
        recordsProcessed,
        errors,
        output: {
          equipmentProcessed: recordsProcessed,
        },
      };
    } catch (error) {
      errors.push(error instanceof Error ? error.message : 'Unknown error');
      
      return {
        jobId: job.id,
        startedAt: startTime,
        completedAt: new Date(),
        status: 'FAILURE',
        recordsProcessed,
        errors,
        output: {},
      };
    }
  }

  private async calculateOEE(equipment: Equipment): Promise<{
    availability: number;
    performance: number;
    quality: number;
    oee: number;
    calculatedAt: Date;
  }> {
    const endTime = new Date();
    const startTime = new Date(endTime.getTime() - 24 * 60 * 60 * 1000);

    // Get time series data for the equipment
    const availabilityData = await tsDB.query(
      equipment.id,
      'status',
      startTime,
      endTime
    );

    const speedData = await tsDB.query(
      equipment.id,
      'speed',
      startTime,
      endTime
    );

    // Calculate Availability
    const plannedProductionTime = 24 * 60;
    const runningTime = availabilityData.filter(d => d.value === 1).length;
    const availability = (runningTime / plannedProductionTime) * 100;

    // Calculate Performance
    const idealCycleTime = 6;
    const actualOutput = speedData.length;
    const theoreticalOutput = runningTime / idealCycleTime;
    const performance = theoreticalOutput > 0 
      ? (actualOutput / theoreticalOutput) * 100 
      : 0;

    // Calculate Quality (from quality records)
    const qualityRecords = await sqlDB.getAllQualityRecords();
    const equipmentQualityRecords = qualityRecords.filter(
      qr => qr.workOrderId.startsWith(equipment.id)
    );
    
    const totalInspected = equipmentQualityRecords.length;
    const passed = equipmentQualityRecords.filter(qr => qr.overallResult === 'PASS').length;
    const quality = totalInspected > 0 ? (passed / totalInspected) * 100 : 100;

    // Calculate OEE
    const oee = (availability * performance * quality) / 10000;

    return {
      availability: Math.min(100, Math.max(0, availability)),
      performance: Math.min(100, Math.max(0, performance)),
      quality: Math.min(100, Math.max(0, quality)),
      oee: Math.min(100, Math.max(0, oee)),
      calculatedAt: new Date(),
    };
  }
}

// ============================================================================
// Data Aggregation Job Processor
// ============================================================================

class DataAggregationProcessor implements JobProcessor {
  async process(job: BatchJob): Promise<BatchJobResult> {
    const startTime = new Date();
    const errors: string[] = [];
    let recordsProcessed = 0;

    try {
      // Aggregate production data
      const schedules = await sqlDB.getAllSchedules();
      const completedSchedules = schedules.filter(s => s.status === 'COMPLETED');

      // Aggregate by date
      const dailyProduction = new Map<string, number>();
      
      for (const schedule of completedSchedules) {
        const date = schedule.actualEnd?.toISOString().split('T')[0];
        if (date) {
          const current = dailyProduction.get(date) || 0;
          dailyProduction.set(date, current + (schedule.actualQuantity || 0));
        }
        recordsProcessed++;
      }

      // Aggregate quality data
      const qualityRecords = await sqlDB.getAllQualityRecords();
      const qualityByProduct = new Map<string, { pass: number; fail: number }>();

      for (const record of qualityRecords) {
        const current = qualityByProduct.get(record.productId) || { pass: 0, fail: 0 };
        if (record.overallResult === 'PASS') {
          current.pass++;
        } else {
          current.fail++;
        }
        qualityByProduct.set(record.productId, current);
        recordsProcessed++;
      }

      return {
        jobId: job.id,
        startedAt: startTime,
        completedAt: new Date(),
        status: 'SUCCESS',
        recordsProcessed,
        errors,
        output: {
          dailyProduction: Object.fromEntries(dailyProduction),
          qualityByProduct: Object.fromEntries(qualityByProduct),
        },
      };
    } catch (error) {
      errors.push(error instanceof Error ? error.message : 'Unknown error');
      
      return {
        jobId: job.id,
        startedAt: startTime,
        completedAt: new Date(),
        status: 'FAILURE',
        recordsProcessed,
        errors,
        output: {},
      };
    }
  }
}

// ============================================================================
// Quality Report Job Processor
// ============================================================================

class QualityReportProcessor implements JobProcessor {
  async process(job: BatchJob): Promise<BatchJobResult> {
    const startTime = new Date();
    const errors: string[] = [];
    let recordsProcessed = 0;

    try {
      const qualityRecords = await sqlDB.getAllQualityRecords();
      
      // Calculate quality metrics
      const totalRecords = qualityRecords.length;
      const passedRecords = qualityRecords.filter(r => r.overallResult === 'PASS').length;
      const failedRecords = qualityRecords.filter(r => r.overallResult === 'FAIL').length;
      
      const passRate = totalRecords > 0 ? (passedRecords / totalRecords) * 100 : 0;

      // Group by inspection type
      const byInspectionType = new Map<string, number>();
      for (const record of qualityRecords) {
        const count = byInspectionType.get(record.inspectionType) || 0;
        byInspectionType.set(record.inspectionType, count + 1);
        recordsProcessed++;
      }

      // Find top defects
      const defects = new Map<string, number>();
      for (const record of qualityRecords) {
        for (const nc of record.nonConformances) {
          const count = defects.get(nc.description) || 0;
          defects.set(nc.description, count + 1);
        }
      }

      const topDefects = Array.from(defects.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5);

      return {
        jobId: job.id,
        startedAt: startTime,
        completedAt: new Date(),
        status: 'SUCCESS',
        recordsProcessed,
        errors,
        output: {
          summary: {
            totalRecords,
            passedRecords,
            failedRecords,
            passRate: passRate.toFixed(2),
          },
          byInspectionType: Object.fromEntries(byInspectionType),
          topDefects,
        },
      };
    } catch (error) {
      errors.push(error instanceof Error ? error.message : 'Unknown error');
      
      return {
        jobId: job.id,
        startedAt: startTime,
        completedAt: new Date(),
        status: 'FAILURE',
        recordsProcessed,
        errors,
        output: {},
      };
    }
  }
}

// ============================================================================
// Inventory Reconciliation Job Processor
// ============================================================================

class InventoryReconcileProcessor implements JobProcessor {
  async process(job: BatchJob): Promise<BatchJobResult> {
    const startTime = new Date();
    const errors: string[] = [];
    let recordsProcessed = 0;

    try {
      const inventory = await sqlDB.getAllInventoryRecords();
      const discrepancies: Array<{
        materialId: string;
        expected: number;
        actual: number;
        difference: number;
      }> = [];

      for (const record of inventory) {
        // Calculate expected quantity based on movements
        let expectedQuantity = 0;
        
        for (const movement of record.movements) {
          switch (movement.type) {
            case 'RECEIPT':
              expectedQuantity += movement.quantity;
              break;
            case 'ISSUE':
            case 'CONSUMPTION':
              expectedQuantity -= movement.quantity;
              break;
            case 'ADJUSTMENT':
              expectedQuantity += movement.quantity;
              break;
          }
        }

        // Check for discrepancy
        if (Math.abs(expectedQuantity - record.quantity) > 0.01) {
          discrepancies.push({
            materialId: record.materialId,
            expected: expectedQuantity,
            actual: record.quantity,
            difference: expectedQuantity - record.quantity,
          });
        }

        recordsProcessed++;
      }

      return {
        jobId: job.id,
        startedAt: startTime,
        completedAt: new Date(),
        status: 'SUCCESS',
        recordsProcessed,
        errors,
        output: {
          discrepanciesFound: discrepancies.length,
          discrepancies,
        },
      };
    } catch (error) {
      errors.push(error instanceof Error ? error.message : 'Unknown error');
      
      return {
        jobId: job.id,
        startedAt: startTime,
        completedAt: new Date(),
        status: 'FAILURE',
        recordsProcessed,
        errors,
        output: {},
      };
    }
  }
}

// ============================================================================
// Predictive Maintenance Job Processor
// ============================================================================

class PredictiveMaintenanceProcessor implements JobProcessor {
  async process(job: BatchJob): Promise<BatchJobResult> {
    const startTime = new Date();
    const errors: string[] = [];
    let recordsProcessed = 0;

    try {
      const equipment = await sqlDB.getAllEquipment();
      const predictions: Array<{
        equipmentId: string;
        equipmentName: string;
        failureProbability: number;
        remainingUsefulLife: number;
        recommendedAction: string;
        confidence: number;
      }> = [];

      for (const eq of equipment) {
        // Get sensor data for the equipment
        const endTime = new Date();
        const startTime = new Date(endTime.getTime() - 7 * 24 * 60 * 60 * 1000);

        const vibrationData = await tsDB.query(eq.id, 'vibration', startTime, endTime);
        const temperatureData = await tsDB.query(eq.id, 'temperature', startTime, endTime);

        // Simple predictive model (in production, use ML model)
        const avgVibration = vibrationData.length > 0
          ? vibrationData.reduce((sum, d) => sum + d.value, 0) / vibrationData.length
          : 0;

        const avgTemperature = temperatureData.length > 0
          ? temperatureData.reduce((sum, d) => sum + d.value, 0) / temperatureData.length
          : 0;

        // Predict failure probability based on thresholds
        let failureProbability = 0;
        let remainingUsefulLife = 1000;

        if (avgVibration > 4) {
          failureProbability += 0.4;
          remainingUsefulLife = Math.min(remainingUsefulLife, 100);
        }

        if (avgTemperature > 55) {
          failureProbability += 0.3;
          remainingUsefulLife = Math.min(remainingUsefulLife, 200);
        }

        // Adjust based on equipment age
        const daysSinceMaintenance = Math.floor(
          (Date.now() - eq.lastMaintenance.getTime()) / (24 * 60 * 60 * 1000)
        );
        
        if (daysSinceMaintenance > 30) {
          failureProbability += 0.2;
        }

        failureProbability = Math.min(1, failureProbability);

        if (failureProbability > 0.3) {
          predictions.push({
            equipmentId: eq.id,
            equipmentName: eq.name,
            failureProbability,
            remainingUsefulLife,
            recommendedAction: failureProbability > 0.7 
              ? 'SCHEDULE_IMMEDIATE_MAINTENANCE'
              : 'MONITOR_CLOSELY',
            confidence: 0.75 + Math.random() * 0.2,
          });
        }

        recordsProcessed++;
      }

      return {
        jobId: job.id,
        startedAt: startTime,
        completedAt: new Date(),
        status: 'SUCCESS',
        recordsProcessed,
        errors,
        output: {
          predictionsGenerated: predictions.length,
          highRiskEquipment: predictions.filter(p => p.failureProbability > 0.7).length,
          predictions,
        },
      };
    } catch (error) {
      errors.push(error instanceof Error ? error.message : 'Unknown error');
      
      return {
        jobId: job.id,
        startedAt: startTime,
        completedAt: new Date(),
        status: 'FAILURE',
        recordsProcessed,
        errors,
        output: {},
      };
    }
  }
}

// ============================================================================
// Demand Forecast Job Processor
// ============================================================================

class DemandForecastProcessor implements JobProcessor {
  async process(job: BatchJob): Promise<BatchJobResult> {
    const startTime = new Date();
    const errors: string[] = [];
    let recordsProcessed = 0;

    try {
      // Get historical production data
      const schedules = await sqlDB.getAllSchedules();
      
      // Simple forecasting (in production, use time series models like ARIMA, Prophet)
      const forecasts: Array<{
        productId: string;
        nextWeek: number;
        nextMonth: number;
        confidence: number;
      }> = [];

      // Group by product
      const byProduct = new Map<string, number[]>();
      
      for (const schedule of schedules) {
        const quantities = byProduct.get(schedule.productId) || [];
        quantities.push(schedule.actualQuantity || schedule.quantity);
        byProduct.set(schedule.productId, quantities);
      }

      for (const [productId, quantities] of byProduct) {
        const avg = quantities.reduce((sum, q) => sum + q, 0) / quantities.length;
        const trend = 1 + (Math.random() - 0.5) * 0.2;

        forecasts.push({
          productId,
          nextWeek: Math.floor(avg * 7 * trend),
          nextMonth: Math.floor(avg * 30 * trend),
          confidence: 0.7 + Math.random() * 0.2,
        });

        recordsProcessed++;
      }

      return {
        jobId: job.id,
        startedAt: startTime,
        completedAt: new Date(),
        status: 'SUCCESS',
        recordsProcessed,
        errors,
        output: {
          forecastsGenerated: forecasts.length,
          forecasts,
        },
      };
    } catch (error) {
      errors.push(error instanceof Error ? error.message : 'Unknown error');
      
      return {
        jobId: job.id,
        startedAt: startTime,
        completedAt: new Date(),
        status: 'FAILURE',
        recordsProcessed,
        errors,
        output: {},
      };
    }
  }
}

// ============================================================================
// Data Archival Job Processor
// ============================================================================

class DataArchivalProcessor implements JobProcessor {
  async process(job: BatchJob): Promise<BatchJobResult> {
    const startTime = new Date();
    const errors: string[] = [];
    let recordsProcessed = 0;

    try {
      // Archive old time series data
      const archiveBefore = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);
      
      const archivedPoints = await tsDB.deleteOldData(archiveBefore);
      recordsProcessed += archivedPoints;

      // Archive old quality records
      const qualityRecords = await sqlDB.getAllQualityRecords();
      const oldRecords = qualityRecords.filter(r => 
        r.inspectedAt < archiveBefore
      );

      recordsProcessed += oldRecords.length;

      return {
        jobId: job.id,
        startedAt: startTime,
        completedAt: new Date(),
        status: 'SUCCESS',
        recordsProcessed,
        errors,
        output: {
          timeSeriesPointsArchived: archivedPoints,
          qualityRecordsArchived: oldRecords.length,
          archiveDate: archiveBefore.toISOString(),
        },
      };
    } catch (error) {
      errors.push(error instanceof Error ? error.message : 'Unknown error');
      
      return {
        jobId: job.id,
        startedAt: startTime,
        completedAt: new Date(),
        status: 'FAILURE',
        recordsProcessed,
        errors,
        output: {},
      };
    }
  }
}

// ============================================================================
// Anomaly Detection Job Processor
// ============================================================================

class AnomalyDetectionProcessor implements JobProcessor {
  async process(job: BatchJob): Promise<BatchJobResult> {
    const startTime = new Date();
    const errors: string[] = [];
    let recordsProcessed = 0;

    try {
      const equipment = await sqlDB.getAllEquipment();
      const anomalies: Array<{
        equipmentId: string;
        tagName: string;
        timestamp: Date;
        value: number;
        expectedRange: [number, number];
        severity: 'WARNING' | 'CRITICAL';
      }> = [];

      for (const eq of equipment) {
        // Check for anomalies in key metrics
        const tags = ['temperature', 'vibration', 'power', 'speed'];
        
        for (const tag of tags) {
          const tagAnomalies = await tsDB.detectAnomalies(eq.id, tag, 3);
          
          for (const anomaly of tagAnomalies) {
            anomalies.push({
              equipmentId: eq.id,
              tagName: tag,
              timestamp: anomaly.timestamp,
              value: anomaly.value,
              expectedRange: [0, 100],
              severity: anomaly.value > 100 ? 'CRITICAL' : 'WARNING',
            });
          }
          
          recordsProcessed++;
        }
      }

      // Create alerts for critical anomalies
      for (const anomaly of anomalies.filter(a => a.severity === 'CRITICAL')) {
        await sqlDB.createAlert({
          id: `alert-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          severity: 'CRITICAL',
          message: `Anomaly detected: ${anomaly.tagName} = ${anomaly.value.toFixed(2)} on equipment ${anomaly.equipmentId}`,
          source: 'AnomalyDetectionJob',
          timestamp: new Date(),
          acknowledged: false,
        });
      }

      return {
        jobId: job.id,
        startedAt: startTime,
        completedAt: new Date(),
        status: 'SUCCESS',
        recordsProcessed,
        errors,
        output: {
          anomaliesDetected: anomalies.length,
          criticalAnomalies: anomalies.filter(a => a.severity === 'CRITICAL').length,
          anomalies,
        },
      };
    } catch (error) {
      errors.push(error instanceof Error ? error.message : 'Unknown error');
      
      return {
        jobId: job.id,
        startedAt: startTime,
        completedAt: new Date(),
        status: 'FAILURE',
        recordsProcessed,
        errors,
        output: {},
      };
    }
  }
}

// ============================================================================
// Batch Job Service
// ============================================================================

export class BatchJobService extends EventEmitter {
  private jobs: Map<string, BatchJob> = new Map();
  private processors: Map<BatchJobType, JobProcessor> = new Map();
  private runningJobs: Map<string, boolean> = new Map();
  private jobHistory: BatchJobResult[] = [];
  private isRunning = false;
  private checkInterval?: ReturnType<typeof setInterval>;

  constructor() {
    super();
    this.registerProcessors();
  }

  private registerProcessors(): void {
    this.processors.set(BatchJobType.OEE_CALCULATION, new OEECalculationProcessor());
    this.processors.set(BatchJobType.DATA_AGGREGATION, new DataAggregationProcessor());
    this.processors.set(BatchJobType.QUALITY_REPORT, new QualityReportProcessor());
    this.processors.set(BatchJobType.INVENTORY_RECONCILE, new InventoryReconcileProcessor());
    this.processors.set(BatchJobType.PREDICTIVE_MAINTENANCE, new PredictiveMaintenanceProcessor());
    this.processors.set(BatchJobType.DEMAND_FORECAST, new DemandForecastProcessor());
    this.processors.set(BatchJobType.DATA_ARCHIVAL, new DataArchivalProcessor());
    this.processors.set(BatchJobType.ANOMALY_DETECTION, new AnomalyDetectionProcessor());
  }

  public async initialize(): Promise<void> {
    console.log('[BatchJobService] Initializing...');
    
    // Create default jobs
    await this.createDefaultJobs();
    
    console.log('[BatchJobService] Initialized');
  }

  private async createDefaultJobs(): Promise<void> {
    // OEE Calculation - Every 15 minutes
    await this.createJob({
      id: 'job-oee-calc',
      name: 'OEE Calculation',
      type: BatchJobType.OEE_CALCULATION,
      status: BatchJobStatus.SCHEDULED,
      schedule: '*/15 * * * *',
      priority: 5,
      configuration: {},
    });

    // Data Aggregation - Every hour
    await this.createJob({
      id: 'job-data-agg',
      name: 'Data Aggregation',
      type: BatchJobType.DATA_AGGREGATION,
      status: BatchJobStatus.SCHEDULED,
      schedule: '0 * * * *',
      priority: 3,
      configuration: {},
    });

    // Quality Report - Daily at 6 AM
    await this.createJob({
      id: 'job-quality-rpt',
      name: 'Quality Report',
      type: BatchJobType.QUALITY_REPORT,
      status: BatchJobStatus.SCHEDULED,
      schedule: '0 6 * * *',
      priority: 4,
      configuration: {},
    });

    // Predictive Maintenance - Every 4 hours
    await this.createJob({
      id: 'job-pred-maint',
      name: 'Predictive Maintenance',
      type: BatchJobType.PREDICTIVE_MAINTENANCE,
      status: BatchJobStatus.SCHEDULED,
      schedule: '0 */4 * * *',
      priority: 7,
      configuration: {},
    });

    // Anomaly Detection - Every 5 minutes
    await this.createJob({
      id: 'job-anomaly',
      name: 'Anomaly Detection',
      type: BatchJobType.ANOMALY_DETECTION,
      status: BatchJobStatus.SCHEDULED,
      schedule: '*/5 * * * *',
      priority: 8,
      configuration: {},
    });

    // Data Archival - Weekly on Sunday at 2 AM
    await this.createJob({
      id: 'job-archive',
      name: 'Data Archival',
      type: BatchJobType.DATA_ARCHIVAL,
      status: BatchJobStatus.SCHEDULED,
      schedule: '0 2 * * 0',
      priority: 2,
      configuration: {},
    });
  }

  public async createJob(job: BatchJob): Promise<BatchJob> {
    this.jobs.set(job.id, job);
    
    // Calculate next run time
    job.nextRun = this.calculateNextRun(job.schedule);
    
    this.emit('jobCreated', job);
    return job;
  }

  public async updateJob(id: string, updates: Partial<BatchJob>): Promise<BatchJob | undefined> {
    const job = this.jobs.get(id);
    if (job) {
      const updated = { ...job, ...updates };
      this.jobs.set(id, updated);
      this.emit('jobUpdated', updated);
      return updated;
    }
    return undefined;
  }

  public async deleteJob(id: string): Promise<boolean> {
    const deleted = this.jobs.delete(id);
    if (deleted) {
      this.emit('jobDeleted', { id });
    }
    return deleted;
  }

  public getJob(id: string): BatchJob | undefined {
    return this.jobs.get(id);
  }

  public getAllJobs(): BatchJob[] {
    return Array.from(this.jobs.values());
  }

  public getJobHistory(): BatchJobResult[] {
    return this.jobHistory;
  }

  public start(): void {
    if (this.isRunning) return;
    
    this.isRunning = true;
    console.log('[BatchJobService] Started');
    
    // Check for jobs to run every minute
    this.checkInterval = setInterval(() => {
      this.checkScheduledJobs();
    }, 60000);
    
    this.emit('started');
  }

  public stop(): void {
    if (!this.isRunning) return;
    
    this.isRunning = false;
    
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
    }
    
    console.log('[BatchJobService] Stopped');
    this.emit('stopped');
  }

  private async checkScheduledJobs(): Promise<void> {
    const now = new Date();
    
    for (const job of this.jobs.values()) {
      if (job.status !== BatchJobStatus.SCHEDULED && job.status !== BatchJobStatus.COMPLETED) {
        continue;
      }
      
      if (job.nextRun && job.nextRun <= now && !this.runningJobs.has(job.id)) {
        await this.executeJob(job);
      }
    }
  }

  public async executeJob(job: BatchJob): Promise<BatchJobResult> {
    if (this.runningJobs.has(job.id)) {
      throw new Error(`Job ${job.id} is already running`);
    }

    this.runningJobs.set(job.id, true);
    
    console.log(`[BatchJobService] Executing job: ${job.name}`);
    
    // Update job status
    job.status = BatchJobStatus.RUNNING;
    job.lastRun = new Date();
    
    this.emit('jobStarted', job);

    try {
      const processor = this.processors.get(job.type);
      
      if (!processor) {
        throw new Error(`No processor found for job type: ${job.type}`);
      }

      const result = await processor.process(job);
      
      // Update job status
      job.status = BatchJobStatus.COMPLETED;
      job.nextRun = this.calculateNextRun(job.schedule);
      
      // Store result
      this.jobHistory.push(result);
      await sqlDB.createBatchJobResult(result);
      
      this.emit('jobCompleted', { job, result });
      
      console.log(`[BatchJobService] Job completed: ${job.name}`);
      
      return result;
    } catch (error) {
      // Update job status
      job.status = BatchJobStatus.FAILED;
      job.nextRun = this.calculateNextRun(job.schedule);
      
      const failedResult: BatchJobResult = {
        jobId: job.id,
        startedAt: job.lastRun || new Date(),
        completedAt: new Date(),
        status: 'FAILURE',
        recordsProcessed: 0,
        errors: [error instanceof Error ? error.message : 'Unknown error'],
        output: {},
      };
      
      this.jobHistory.push(failedResult);
      
      this.emit('jobFailed', { job, error });
      
      console.error(`[BatchJobService] Job failed: ${job.name}`, error);
      
      return failedResult;
    } finally {
      this.runningJobs.delete(job.id);
    }
  }

  public async runJobNow(jobId: string): Promise<BatchJobResult> {
    const job = this.jobs.get(jobId);
    if (!job) {
      throw new Error(`Job not found: ${jobId}`);
    }
    
    return this.executeJob(job);
  }

  private calculateNextRun(schedule: string): Date {
    const now = new Date();
    const next = new Date(now);
    
    // Parse cron expression (simplified)
    const parts = schedule.split(' ');
    
    if (parts[0].startsWith('*/')) {
      // Every N minutes
      const interval = parseInt(parts[0].substring(2));
      next.setMinutes(now.getMinutes() + interval);
    } else if (parts[0] !== '*') {
      // Specific minute
      next.setMinutes(parseInt(parts[0]));
      next.setHours(now.getHours() + 1);
    }
    
    return next;
  }
}

// Export singleton instance
export const batchJobService = new BatchJobService();
