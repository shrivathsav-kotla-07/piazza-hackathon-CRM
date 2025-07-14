import React, { useCallback, useRef, useState } from 'react';
import ReactFlow, {
  MiniMap,
  Controls,
  Background,
  addEdge,
  useNodesState,
  useEdgesState,
  Handle,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { Mail, RefreshCw, CheckCircle } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';

const ACTION_LABELS = {
  email: 'Send Email',
  whatsapp: 'Send WhatsApp',
};
const ACTION_ICONS = {
  email: <Mail size={14} className="mr-1" />,
  whatsapp: <RefreshCw size={14} className="mr-1" />,
};
const ACTION_COLORS = {
  email: '#2563eb',
  whatsapp: '#059669',
};

// Custom node with handles
const CustomNode = ({ data }) => (
  <div
    style={{
      background: data.bg || '#059669',
      color: '#fff',
      border: `2px solid ${data.bg || '#059669'}`,
      fontWeight: 600,
      borderRadius: 12,
      padding: 10,
      minWidth: 120,
      textAlign: 'center',
      position: 'relative',
    }}
  >
    <Handle type="target" position="top" style={{ background: '#6366f1' }} />
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      {data.icon}
      {data.label}
    </div>
    <Handle type="source" position="bottom" style={{ background: '#6366f1' }} />
  </div>
);

const nodeTypes = {
  custom: CustomNode,
};

const TRIGGER_NODE = {
  id: 'lead', // changed from 'trigger' to 'lead'
  type: 'custom',
  data: { label: 'Lead Created', icon: <CheckCircle size={14} className="mr-1" />, bg: '#059669' },
  position: { x: 100, y: 200 },
};

function WorkflowDesigner() {
  const [nodes, setNodes, onNodesChange] = useNodesState([TRIGGER_NODE]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [actionCount, setActionCount] = useState(0);
  const [selectedType, setSelectedType] = useState('email');
  const nodeIdRef = useRef(1);
  const [executing, setExecuting] = useState(false);
  const [syncing, setSyncing] = useState(false);

  // Add this handler to persist edges
  const onConnect = useCallback(
    (params) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  // Add action node
  const addActionNode = () => {
    if (actionCount >= 3) {
      toast.error('Max 3 action nodes allowed');
      return;
    }
    const type = selectedType;
    const id = `action-${nodeIdRef.current++}`;
    setNodes((nds) => [
      ...nds,
      {
        id,
        type: 'custom',
        data: {
          label: ACTION_LABELS[type],
          icon: ACTION_ICONS[type],
          actionType: type,
          bg: ACTION_COLORS[type],
        },
        position: { x: 250 + Math.random() * 200, y: 100 + Math.random() * 200 },
      },
    ]);
    setActionCount((c) => c + 1);
  };

  // Sync workflow to backend
  const syncGraph = async () => {
    if (edges.length === 0) {
      toast.error('⚠ Please connect at least one action');
      return;
    }
    setSyncing(true);
    // Send node definitions (id and type) to backend
    const nodeDefs = nodes
      .filter((n) => n.id !== 'lead')
      .map((n) => ({
        id: n.id,
        type: n.data?.actionType || 'unknown'
      }));
    const edgeList = edges.map((e) => [e.source, e.target]);
    const graphData = {
      nodes: nodeDefs,
      edges: edgeList,
      entry: 'lead',
    };
    try {
      const res = await fetch('/update-graph', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(graphData),
      });
      const result = await res.json();
      if (result.status === 'Graph updated') {
        toast.success('✅ Graph synced');
      } else {
        toast.error('❌ Failed to update graph');
      }
    } catch (err) {
      toast.error('❌ Sync failed');
      console.error(err);
    } finally {
      setSyncing(false);
    }
  };

  // Execute workflow: sync and trigger backend
  const executeWorkflow = async () => {
    setExecuting(true);
    try {
      // Sync the workflow graph to backend first
      await syncGraph();

      // Call the backend to execute the workflow
      const res = await fetch('/run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      const text = await res.text();
      let result;
      try {
        result = JSON.parse(text);
      } catch {
        toast.error('Workflow execution failed: Invalid backend response.');
        setExecuting(false);
        return;
      }

      if (result.status === 'executed') {
        toast.success('Workflow executed! Check your email.');
        console.log('Workflow output:', result.output);
      } else {
        toast.error('Workflow execution failed.');
        console.error(result);
      }
    } catch (err) {
      toast.error('Workflow execution error.');
      console.error(err);
    } finally {
      setExecuting(false);
    }
  };

  return (
    <div className="card">
      <Toaster position="top-center" />
      <div className="card-header">
        <h2 className="card-title">Workflow Designer</h2>
        <p className="card-subtitle">
          Design automation workflows for your leads
        </p>
      </div>
      <div className="card-body">
        <div className="flex space-x-3 mb-4 items-center">
          <select
            value={selectedType}
            onChange={e => setSelectedType(e.target.value)}
            className="form-select"
            style={{ padding: '0.5rem 1rem', borderRadius: 8, border: '1px solid #d1d5db', fontWeight: 500 }}
          >
            <option value="email">Send Email</option>
            <option value="whatsapp">Send WhatsApp</option>
          </select>
          <button
            onClick={addActionNode}
            className="btn btn-primary btn-sm"
          >
            {selectedType === 'email' ? <Mail size={14} /> : <RefreshCw size={14} />}
            <span>Add Action</span>
          </button>
          <button
            onClick={syncGraph}
            className="btn btn-secondary btn-sm"
            disabled={syncing}
          >
            🔄 Sync
          </button>
          <button
            onClick={executeWorkflow}
            className="btn btn-success btn-sm"
            disabled={executing}
          >
            🚀 Execute Workflow
          </button>
        </div>
        <div style={{ height: 400, background: '#f3f4f6', borderRadius: 12, border: '1px solid #e5e7eb' }}>
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect} // <-- Add this line
            nodeTypes={nodeTypes}
            fitView
          >
            <MiniMap />
            <Controls />
            <Background color="#e0e7ef" gap={16} />
          </ReactFlow>
        </div>
      </div>
    </div>
  );
}

export default WorkflowDesigner; 