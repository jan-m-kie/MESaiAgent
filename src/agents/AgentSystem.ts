// AI Agent System for MES
// Orchestrates intelligent agents that handle MES capabilities

import type {
  AIAgent,
  AgentAction,
  AgentConfiguration,
  ProductionSchedule,
} from '@/types/isa95';
import { AgentType, AgentStatus } from '@/types/isa95';

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

// Agent Message Bus for inter-agent communication
export interface AgentMessage {
  id: string;
  from: string;
  to: string | 'BROADCAST';
  type: string;
  payload: any;
  timestamp: Date;
  priority: number;
}

// Base Agent Class
export abstract class BaseAgent extends EventEmitter {
  public id: string;
  public name: string;
  public type: AgentType;
  public status: AgentStatus = AgentStatus.IDLE;
  public capabilities: string[] = [];
  public configuration: AgentConfiguration;
  public lastAction?: AgentAction;
  public performance = {
    totalActions: 0,
    successfulActions: 0,
    averageConfidence: 0,
    accuracy: 0,
  };

  protected messageQueue: AgentMessage[] = [];
  protected isProcessing = false;

  constructor(
    id: string,
    name: string,
    type: AgentType,
    configuration: Partial<AgentConfiguration> = {}
  ) {
    super();
    this.id = id;
    this.name = name;
    this.type = type;
    this.configuration = {
      autoExecute: true,
      confidenceThreshold: 0.75,
      notificationEnabled: true,
      learningMode: 'SUPERVISED',
      schedule: '*/5 * * * *',
      ...configuration,
    };
  }

  // Initialize the agent
  public async initialize(): Promise<void> {
    console.log(`[Agent ${this.name}] Initializing...`);
    await this.onInitialize();
    this.status = AgentStatus.IDLE;
    this.emit('initialized', { agentId: this.id });
  }

  // Main processing loop
  public async process(): Promise<void> {
    if (this.isProcessing || this.status === AgentStatus.ERROR) return;
    
    this.isProcessing = true;
    this.status = AgentStatus.RUNNING;

    try {
      // Process message queue
      await this.processMessages();
      
      // Execute agent-specific logic
      await this.onProcess();
      
      this.status = AgentStatus.IDLE;
    } catch (error) {
      console.error(`[Agent ${this.name}] Error:`, error);
      this.status = AgentStatus.ERROR;
      this.emit('error', { agentId: this.id, error });
    } finally {
      this.isProcessing = false;
    }
  }

  // Receive message from other agents
  public receiveMessage(message: AgentMessage): void {
    this.messageQueue.push(message);
    this.emit('messageReceived', message);
  }

  // Process queued messages
  protected async processMessages(): Promise<void> {
    while (this.messageQueue.length > 0) {
      const message = this.messageQueue.shift()!;
      await this.onMessage(message);
    }
  }

  // Record an action
  protected recordAction(
    type: string,
    description: string,
    result: 'SUCCESS' | 'FAILURE' | 'PENDING',
    confidence: number,
    metadata: Record<string, any> = {}
  ): void {
    this.lastAction = {
      id: `${this.id}-${Date.now()}`,
      timestamp: new Date(),
      type,
      description,
      result,
      confidence,
      metadata,
    };

    this.performance.totalActions++;
    if (result === 'SUCCESS') {
      this.performance.successfulActions++;
    }
    
    // Update average confidence
    this.performance.averageConfidence = 
      (this.performance.averageConfidence * (this.performance.totalActions - 1) + confidence) /
      this.performance.totalActions;

    this.emit('action', this.lastAction);
  }

  // Abstract methods to be implemented by specific agents
  protected abstract onInitialize(): Promise<void>;
  protected abstract onProcess(): Promise<void>;
  protected abstract onMessage(message: AgentMessage): Promise<void>;

  // Get agent state
  public getState(): AIAgent {
    return {
      id: this.id,
      name: this.name,
      type: this.type,
      status: this.status,
      capabilities: this.capabilities,
      lastAction: this.lastAction,
      performance: this.performance,
      configuration: this.configuration,
    };
  }
}

// ============================================================================
// Production Scheduling Agent
// ============================================================================

export class SchedulingAgent extends BaseAgent {
  private schedules: ProductionSchedule[] = [];

  constructor(id: string, configuration?: Partial<AgentConfiguration>) {
    super(id, 'Production Scheduler', AgentType.SCHEDULER, configuration);
    this.capabilities = [
      'schedule_optimization',
      'resource_allocation',
      'priority_management',
      'conflict_resolution',
    ];
  }

  protected async onInitialize(): Promise<void> {
    console.log(`[SchedulingAgent] Loading production data...`);
  }

  protected async onProcess(): Promise<void> {
    // Optimize schedules based on current conditions
    await this.optimizeSchedules();
    
    // Check for conflicts and resolve them
    await this.resolveConflicts();
  }

  protected async onMessage(message: AgentMessage): Promise<void> {
    switch (message.type) {
      case 'EQUIPMENT_STATUS_CHANGED':
        await this.handleEquipmentStatusChange(message.payload);
        break;
      case 'NEW_WORK_ORDER':
        await this.handleNewWorkOrder(message.payload);
        break;
      case 'SCHEDULE_DELAY':
        await this.handleScheduleDelay(message.payload);
        break;
    }
  }

  private async optimizeSchedules(): Promise<void> {
    const optimizationResult = {
      schedulesOptimized: 0,
      efficiencyGain: 0,
      conflictsResolved: 0,
    };

    // Simulate optimization logic
    for (const _schedule of this.schedules) {
      const canOptimize = Math.random() > 0.7;
      if (canOptimize) {
        optimizationResult.schedulesOptimized++;
        optimizationResult.efficiencyGain += Math.random() * 5;
      }
    }

    if (optimizationResult.schedulesOptimized > 0) {
      this.recordAction(
        'SCHEDULE_OPTIMIZATION',
        `Optimized ${optimizationResult.schedulesOptimized} schedules, ${optimizationResult.efficiencyGain.toFixed(1)}% efficiency gain`,
        'SUCCESS',
        0.85,
        optimizationResult
      );
    }
  }

  private async resolveConflicts(): Promise<void> {
    const conflicts = this.detectConflicts();
    
    for (const conflict of conflicts) {
      const resolution = this.decideResolution(conflict);
      
      this.recordAction(
        'CONFLICT_RESOLUTION',
        `Resolved conflict: ${conflict.description}`,
        'SUCCESS',
        resolution.confidence,
        { conflict, resolution }
      );
    }
  }

  private detectConflicts(): Array<{ description: string; severity: string }> {
    return [];
  }

  private decideResolution(_conflict: any): { action: string; confidence: number } {
    return {
      action: 'reschedule',
      confidence: 0.82,
    };
  }

  private async handleEquipmentStatusChange(payload: any): Promise<void> {
    this.recordAction(
      'EQUIPMENT_RESPONSE',
      `Responding to equipment ${payload.equipmentId} status change to ${payload.status}`,
      'SUCCESS',
      0.9,
      payload
    );
  }

  private async handleNewWorkOrder(payload: any): Promise<void> {
    this.recordAction(
      'WORK_ORDER_SCHEDULING',
      `Scheduled new work order ${payload.workOrderId}`,
      'SUCCESS',
      0.88,
      payload
    );
  }

  private async handleScheduleDelay(payload: any): Promise<void> {
    this.recordAction(
      'DELAY_PROPAGATION',
      `Propagating delay from schedule ${payload.scheduleId}`,
      'SUCCESS',
      0.85,
      payload
    );
  }
}

// ============================================================================
// Quality Assurance Agent
// ============================================================================

export class QualityAgent extends BaseAgent {
  constructor(id: string, configuration?: Partial<AgentConfiguration>) {
    super(id, 'Quality Inspector', AgentType.QUALITY_INSPECTOR, configuration);
    this.capabilities = [
      'defect_detection',
      'quality_prediction',
      'root_cause_analysis',
      'compliance_monitoring',
    ];
  }

  protected async onInitialize(): Promise<void> {
    console.log(`[QualityAgent] Loading quality models...`);
  }

  protected async onProcess(): Promise<void> {
    // Analyze quality trends
    await this.analyzeQualityTrends();
    
    // Predict quality issues
    await this.predictQualityIssues();
  }

  protected async onMessage(message: AgentMessage): Promise<void> {
    switch (message.type) {
      case 'QUALITY_CHECK_REQUIRED':
        await this.performQualityCheck(message.payload);
        break;
      case 'DEFECT_DETECTED':
        await this.handleDefect(message.payload);
        break;
    }
  }

  private async analyzeQualityTrends(): Promise<void> {
    const trends = {
      defectRate: 0.02,
      trendDirection: 'IMPROVING',
      recommendations: ['Adjust parameter X', 'Check equipment Y'],
    };

    this.recordAction(
      'QUALITY_ANALYSIS',
      `Quality trend analysis: ${trends.trendDirection}`,
      'SUCCESS',
      0.87,
      trends
    );
  }

  private async predictQualityIssues(): Promise<void> {
    const predictions = [];
    
    for (let i = 0; i < 3; i++) {
      if (Math.random() > 0.7) {
        predictions.push({
          equipmentId: `EQ-${i}`,
          probability: Math.random(),
          predictedIssue: 'Parameter drift',
        });
      }
    }

    if (predictions.length > 0) {
      this.recordAction(
        'QUALITY_PREDICTION',
        `Predicted ${predictions.length} potential quality issues`,
        'SUCCESS',
        0.78,
        { predictions }
      );
    }
  }

  private async performQualityCheck(payload: any): Promise<void> {
    const result = {
      passed: Math.random() > 0.1,
      confidence: 0.92,
      measurements: [],
    };

    this.recordAction(
      'QUALITY_CHECK',
      `Quality check for ${payload.workOrderId}: ${result.passed ? 'PASSED' : 'FAILED'}`,
      'SUCCESS',
      result.confidence,
      result
    );
  }

  private async handleDefect(payload: any): Promise<void> {
    const rootCause = await this.analyzeRootCause(payload);
    
    this.recordAction(
      'ROOT_CAUSE_ANALYSIS',
      `Analyzed defect root cause: ${rootCause.cause}`,
      'SUCCESS',
      rootCause.confidence,
      rootCause
    );
  }

  private async analyzeRootCause(_defect: any): Promise<{ cause: string; confidence: number }> {
    return {
      cause: 'Equipment calibration drift',
      confidence: 0.84,
    };
  }
}

// ============================================================================
// Predictive Maintenance Agent
// ============================================================================

export class MaintenanceAgent extends BaseAgent {
  private equipmentHealth: Map<string, any> = new Map();

  constructor(id: string, configuration?: Partial<AgentConfiguration>) {
    super(id, 'Maintenance Predictor', AgentType.MAINTENANCE_PREDICTOR, configuration);
    this.capabilities = [
      'failure_prediction',
      'health_monitoring',
      'maintenance_optimization',
      'spare_parts_forecasting',
    ];
  }

  protected async onInitialize(): Promise<void> {
    console.log(`[MaintenanceAgent] Loading predictive models...`);
  }

  protected async onProcess(): Promise<void> {
    // Monitor equipment health
    await this.monitorEquipmentHealth();
    
    // Predict failures
    await this.predictFailures();
  }

  protected async onMessage(message: AgentMessage): Promise<void> {
    switch (message.type) {
      case 'EQUIPMENT_ALARM':
        await this.handleEquipmentAlarm(message.payload);
        break;
      case 'MAINTENANCE_COMPLETED':
        await this.handleMaintenanceCompleted(message.payload);
        break;
    }
  }

  private async monitorEquipmentHealth(): Promise<void> {
    const healthUpdates = [];

    for (const [equipmentId, health] of this.equipmentHealth) {
      const newHealth = {
        ...health,
        score: Math.max(0, Math.min(100, health.score - Math.random() * 2)),
        lastUpdate: new Date(),
      };
      
      this.equipmentHealth.set(equipmentId, newHealth);
      healthUpdates.push({ equipmentId, health: newHealth });
    }

    if (healthUpdates.length > 0) {
      this.recordAction(
        'HEALTH_MONITORING',
        `Monitored ${healthUpdates.length} equipment health status`,
        'SUCCESS',
        0.9,
        { updates: healthUpdates }
      );
    }
  }

  private async predictFailures(): Promise<void> {
    const predictions = [];

    for (const [equipmentId, health] of this.equipmentHealth) {
      if (health.score < 70) {
        const remainingUsefulLife = this.calculateRUL(health);
        predictions.push({
          equipmentId,
          probability: (100 - health.score) / 100,
          remainingHours: remainingUsefulLife,
          recommendedAction: remainingUsefulLife < 24 ? 'SCHEDULE_MAINTENANCE' : 'MONITOR',
        });
      }
    }

    if (predictions.length > 0) {
      this.recordAction(
        'FAILURE_PREDICTION',
        `Predicted ${predictions.length} potential failures`,
        'SUCCESS',
        0.82,
        { predictions }
      );
    }
  }

  private calculateRUL(health: any): number {
    return Math.floor(health.score * 10 * Math.random());
  }

  private async handleEquipmentAlarm(payload: any): Promise<void> {
    this.recordAction(
      'ALARM_ANALYSIS',
      `Analyzing alarm from ${payload.equipmentId}: ${payload.alarmCode}`,
      'SUCCESS',
      0.88,
      payload
    );
  }

  private async handleMaintenanceCompleted(payload: any): Promise<void> {
    this.equipmentHealth.set(payload.equipmentId, {
      score: 100,
      lastMaintenance: new Date(),
      lastUpdate: new Date(),
    });

    this.recordAction(
      'MAINTENANCE_UPDATE',
      `Updated health status after maintenance for ${payload.equipmentId}`,
      'SUCCESS',
      0.95,
      payload
    );
  }
}

// ============================================================================
// Inventory Optimization Agent
// ============================================================================

export class InventoryAgent extends BaseAgent {
  private inventory: Map<string, any> = new Map();

  constructor(id: string, configuration?: Partial<AgentConfiguration>) {
    super(id, 'Inventory Optimizer', AgentType.INVENTORY_OPTIMIZER, configuration);
    this.capabilities = [
      'demand_forecasting',
      'reorder_optimization',
      'inventory_balancing',
      'expiry_management',
    ];
  }

  protected async onInitialize(): Promise<void> {
    console.log(`[InventoryAgent] Loading inventory data...`);
  }

  protected async onProcess(): Promise<void> {
    // Forecast demand
    await this.forecastDemand();
    
    // Optimize reorder points
    await this.optimizeReorderPoints();
  }

  protected async onMessage(message: AgentMessage): Promise<void> {
    switch (message.type) {
      case 'INVENTORY_CONSUMED':
        await this.handleInventoryConsumption(message.payload);
        break;
      case 'INVENTORY_RECEIVED':
        await this.handleInventoryReceived(message.payload);
        break;
    }
  }

  private async forecastDemand(): Promise<void> {
    const forecasts = [];
    
    for (const [materialId, _itemData] of this.inventory) {
      const forecast = {
        materialId,
        nextWeek: Math.floor(Math.random() * 1000),
        nextMonth: Math.floor(Math.random() * 5000),
        confidence: 0.75 + Math.random() * 0.2,
      };
      forecasts.push(forecast);
    }

    this.recordAction(
      'DEMAND_FORECAST',
      `Generated demand forecasts for ${forecasts.length} materials`,
      'SUCCESS',
      0.8,
      { forecasts }
    );
  }

  private async optimizeReorderPoints(): Promise<void> {
    const recommendations = [];

    for (const [materialId, itemData] of this.inventory) {
      if (itemData.quantity < itemData.reorderPoint * 1.2) {
        recommendations.push({
          materialId,
          currentROP: itemData.reorderPoint,
          recommendedROP: Math.floor(itemData.reorderPoint * 1.1),
          urgency: itemData.quantity < itemData.reorderPoint ? 'HIGH' : 'MEDIUM',
        });
      }
    }

    if (recommendations.length > 0) {
      this.recordAction(
        'REORDER_OPTIMIZATION',
        `Generated ${recommendations.length} reorder recommendations`,
        'SUCCESS',
        0.85,
        { recommendations }
      );
    }
  }

  private async handleInventoryConsumption(payload: any): Promise<void> {
    const data = this.inventory.get(payload.materialId);
    if (data) {
      data.quantity -= payload.quantity;
      
      if (data.quantity <= data.reorderPoint) {
        this.emit('reorderRequired', {
          materialId: payload.materialId,
          currentQuantity: data.quantity,
          reorderPoint: data.reorderPoint,
        });
      }
    }
  }

  private async handleInventoryReceived(payload: any): Promise<void> {
    const data = this.inventory.get(payload.materialId);
    if (data) {
      data.quantity += payload.quantity;
      data.lastReceived = new Date();
    }
  }
}

// ============================================================================
// Anomaly Detection Agent
// ============================================================================

export class AnomalyDetectionAgent extends BaseAgent {
  private baselinePatterns: Map<string, any> = new Map();

  constructor(id: string, configuration?: Partial<AgentConfiguration>) {
    super(id, 'Anomaly Detector', AgentType.ANOMALY_DETECTOR, configuration);
    this.capabilities = [
      'pattern_recognition',
      'anomaly_detection',
      'trend_analysis',
      'early_warning',
    ];
  }

  protected async onInitialize(): Promise<void> {
    console.log(`[AnomalyAgent] Loading baseline patterns...`);
  }

  protected async onProcess(): Promise<void> {
    // Detect anomalies in real-time data
    await this.detectAnomalies();
    
    // Update baseline patterns
    await this.updateBaselines();
  }

  protected async onMessage(message: AgentMessage): Promise<void> {
    switch (message.type) {
      case 'NEW_DATA_POINT':
        await this.analyzeDataPoint(message.payload);
        break;
      case 'ALERT_ACKNOWLEDGED':
        await this.handleAlertAcknowledged(message.payload);
        break;
    }
  }

  private async detectAnomalies(): Promise<void> {
    const anomalies = [];

    for (const [metricId, baseline] of this.baselinePatterns) {
      const currentValue = Math.random() * baseline.max * 1.5;
      
      if (currentValue > baseline.max * 1.3 || currentValue < baseline.min * 0.7) {
        anomalies.push({
          metricId,
          currentValue,
          expectedRange: [baseline.min, baseline.max],
          severity: currentValue > baseline.max * 1.5 ? 'CRITICAL' : 'WARNING',
          timestamp: new Date(),
        });
      }
    }

    if (anomalies.length > 0) {
      this.recordAction(
        'ANOMALY_DETECTED',
        `Detected ${anomalies.length} anomalies`,
        'SUCCESS',
        0.88,
        { anomalies }
      );
    }
  }

  private async updateBaselines(): Promise<void> {
    for (const [, baseline] of this.baselinePatterns) {
      baseline.min *= 0.99 + Math.random() * 0.02;
      baseline.max *= 0.99 + Math.random() * 0.02;
    }
  }

  private async analyzeDataPoint(payload: any): Promise<void> {
    const baseline = this.baselinePatterns.get(payload.metricId);
    
    if (baseline) {
      const isAnomaly = payload.value > baseline.max || payload.value < baseline.min;
      
      if (isAnomaly) {
        this.recordAction(
          'REALTIME_ANOMALY',
          `Real-time anomaly detected: ${payload.metricId} = ${payload.value}`,
          'SUCCESS',
          0.9,
          payload
        );
      }
    }
  }

  private async handleAlertAcknowledged(payload: any): Promise<void> {
    this.recordAction(
      'ALERT_LEARNING',
      `Learning from acknowledged alert: ${payload.alertId}`,
      'SUCCESS',
      0.85,
      payload
    );
  }
}

// ============================================================================
// Agent Orchestrator
// ============================================================================

export class AgentOrchestrator extends EventEmitter {
  private agents: Map<string, BaseAgent> = new Map();
  private messageBus: AgentMessage[] = [];
  private isRunning = false;
  private processInterval?: ReturnType<typeof setInterval>;

  // Register an agent
  public registerAgent(agent: BaseAgent): void {
    this.agents.set(agent.id, agent);
    
    // Subscribe to agent events
    agent.on('action', (action: any) => {
      this.emit('agentAction', { agentId: agent.id, action });
    });
    
    agent.on('error', (error: any) => {
      this.emit('agentError', { agentId: agent.id, error });
    });

    console.log(`[Orchestrator] Registered agent: ${agent.name}`);
  }

  // Unregister an agent
  public unregisterAgent(agentId: string): void {
    const agent = this.agents.get(agentId);
    if (agent) {
      agent.removeAllListeners();
      this.agents.delete(agentId);
      console.log(`[Orchestrator] Unregistered agent: ${agentId}`);
    }
  }

  // Initialize all agents
  public async initialize(): Promise<void> {
    console.log('[Orchestrator] Initializing all agents...');
    
    for (const agent of this.agents.values()) {
      await agent.initialize();
    }
    
    this.emit('initialized');
  }

  // Start the orchestrator
  public start(intervalMs: number = 5000): void {
    if (this.isRunning) return;
    
    this.isRunning = true;
    console.log('[Orchestrator] Started');
    
    this.processInterval = setInterval(() => {
      this.processAllAgents();
    }, intervalMs);
    
    this.emit('started');
  }

  // Stop the orchestrator
  public stop(): void {
    if (!this.isRunning) return;
    
    this.isRunning = false;
    
    if (this.processInterval) {
      clearInterval(this.processInterval);
    }
    
    console.log('[Orchestrator] Stopped');
    this.emit('stopped');
  }

  // Process all agents
  private async processAllAgents(): Promise<void> {
    for (const agent of this.agents.values()) {
      await agent.process();
    }
    
    // Process message bus
    await this.processMessageBus();
  }

  // Send message between agents
  public sendMessage(message: Omit<AgentMessage, 'id' | 'timestamp'>): void {
    const fullMessage: AgentMessage = {
      ...message,
      id: `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date(),
    };

    if (message.to === 'BROADCAST') {
      // Broadcast to all agents except sender
      for (const [id, agent] of this.agents) {
        if (id !== message.from) {
          agent.receiveMessage(fullMessage);
        }
      }
    } else {
      // Send to specific agent
      const targetAgent = this.agents.get(message.to);
      if (targetAgent) {
        targetAgent.receiveMessage(fullMessage);
      }
    }

    this.messageBus.push(fullMessage);
  }

  // Process message bus (for logging, auditing, etc.)
  private async processMessageBus(): Promise<void> {
    // Keep only recent messages
    const cutoff = new Date(Date.now() - 3600000);
    this.messageBus = this.messageBus.filter(m => m.timestamp > cutoff);
  }

  // Get all agent states
  public getAllAgentStates(): AIAgent[] {
    return Array.from(this.agents.values()).map(agent => agent.getState());
  }

  // Get agent by ID
  public getAgent(agentId: string): BaseAgent | undefined {
    return this.agents.get(agentId);
  }

  // Get agents by type
  public getAgentsByType(type: AgentType): BaseAgent[] {
    return Array.from(this.agents.values()).filter(agent => agent.type === type);
  }
}

// Singleton instance
export const agentOrchestrator = new AgentOrchestrator();
