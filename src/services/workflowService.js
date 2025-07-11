// Workflow Service - Handles workflow automation logic
export class WorkflowService {
  // Add a new workflow node
  static addWorkflowNode(nodes, nodeType) {
    const newNode = {
      id: `node-${Date.now()}`,
      type: nodeType,
      label: nodeType === 'email' ? 'Send Email' : 'Update Status',
      x: 250 + nodes.length * 150,
      y: 50
    };
    
    return [...nodes, newNode];
  }

  // Connect two workflow nodes
  static connectNodes(connections, fromId, toId) {
    const connection = { from: fromId, to: toId };
    return [...connections, connection];
  }

  // Execute workflow for a lead
  static executeWorkflow(lead, workflowNodes) {
    const emailNodes = workflowNodes.filter(node => node.type === 'email');
    const statusNodes = workflowNodes.filter(node => node.type === 'status');
    
    const actions = [];
    
    if (emailNodes.length > 0) {
      actions.push({
        type: 'email',
        message: `Email sent to ${lead.name}`,
        delay: 1000
      });
    }
    
    if (statusNodes.length > 0) {
      actions.push({
        type: 'status',
        newStatus: 'Contacted',
        delay: 1500
      });
    }
    
    return actions;
  }

  // Get workflow node by type
  static getNodesByType(nodes, type) {
    return nodes.filter(node => node.type === type);
  }

  // Validate workflow connection
  static canConnectNodes(fromNode, toNode) {
    if (!fromNode || !toNode) return false;
    if (fromNode.id === toNode.id) return false;
    
    // Prevent circular connections
    if (fromNode.type === 'trigger' && toNode.type === 'trigger') return false;
    
    return true;
  }
} 