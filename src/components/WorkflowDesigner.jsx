import React from 'react';
import { Mail, RefreshCw, CheckCircle } from 'lucide-react';

const WorkflowDesigner = ({ 
  workflowNodes, 
  workflowConnections, 
  connectingFrom, 
  onAddNode, 
  onNodeClick 
}) => {
  return (
    <div className="card">
      <div className="card-header">
        <h2 className="card-title">Workflow Designer</h2>
        <p className="card-subtitle">
          Design automation workflows for your leads
        </p>
      </div>
      
      <div className="card-body">
        <div className="flex space-x-3 mb-4">
          <button
            onClick={() => onAddNode('email')}
            className="btn btn-primary btn-sm"
          >
            <Mail size={14} />
            <span>Add Email Action</span>
          </button>
          <button
            onClick={() => onAddNode('status')}
            className="btn btn-success btn-sm"
          >
            <RefreshCw size={14} />
            <span>Add Status Update</span>
          </button>
        </div>
        
        <div className="workflow-canvas">
          <svg className="absolute inset-0 w-full h-full">
            {workflowConnections.map((connection, index) => {
              const fromNode = workflowNodes.find(n => n.id === connection.from);
              const toNode = workflowNodes.find(n => n.id === connection.to);
              if (!fromNode || !toNode) return null;
              
              return (
                <line
                  key={index}
                  x1={fromNode.x + 50}
                  y1={fromNode.y + 20}
                  x2={toNode.x + 50}
                  y2={toNode.y + 20}
                  className="workflow-connection"
                  markerEnd="url(#arrowhead)"
                />
              );
            })}
            
            <defs>
              <marker
                id="arrowhead"
                markerWidth="10"
                markerHeight="7"
                refX="9"
                refY="3.5"
                orient="auto"
              >
                <polygon points="0 0, 10 3.5, 0 7" className="workflow-arrow" />
              </marker>
            </defs>
          </svg>
          
          {workflowNodes.map((node) => (
            <div
              key={node.id}
              className={`workflow-node ${node.type} ${
                connectingFrom?.id === node.id ? 'connecting' : ''
              }`}
              style={{
                left: `${node.x}px`,
                top: `${node.y}px`
              }}
              onClick={() => onNodeClick(node)}
            >
              <div className="flex items-center justify-center h-full">
                {node.type === 'trigger' && <CheckCircle size={14} className="mr-1" />}
                {node.type === 'email' && <Mail size={14} className="mr-1" />}
                {node.type === 'status' && <RefreshCw size={14} className="mr-1" />}
                <span className="text-xs">{node.label}</span>
              </div>
            </div>
          ))}
        </div>
        
        {connectingFrom && (
          <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-sm text-yellow-800">
              Click on another node to connect it with "{connectingFrom.label}"
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default WorkflowDesigner; 