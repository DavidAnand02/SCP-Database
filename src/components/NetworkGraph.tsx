import React, { useMemo, useState, useEffect, useRef } from 'react';
import CytoscapeComponent from 'react-cytoscapejs';
import cytoscape from 'cytoscape';
import fcose from 'cytoscape-fcose';
import { SCPEntry } from '../types';
import { Search, Filter, Maximize2, Minimize2, Activity, Users, Shield, Database, Info, X, RefreshCw, Zap, Focus, ChevronUp, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import _ from 'lodash';

// Register layout
cytoscape.use(fcose);

interface NetworkGraphProps {
  data: SCPEntry[];
  onNodeClick?: (id: string) => void;
}

interface NodeData {
  id: string;
  label: string;
  type: 'scp' | 'personnel' | 'department' | 'mtf' | 'staff';
  subType?: string;
  degree?: number;
}

interface EdgeData {
  id: string;
  source: string;
  target: string;
  label?: string;
}

const NODE_COLORS = {
  scp: '#b91c1c',       // Deep Crimson (Anomalous)
  personnel: '#2563eb', // Intelligence Blue (Agents)
  department: '#06b6d4', // Vibrant Cyan (Bureaucracy & Research)
  mtf: '#166534',       // Tactical Green (Special Ops)
  staff: '#d97706',     // Amber (Administrative)
};

const EXCLUDED_VALUES = [
  'none', 'n/a', 'unknown', '[redacted]', '[data expunged]', 
  'not in source', 'missing', 'not mentioned', 'null', 'undefined'
];

export const NetworkGraph: React.FC<NetworkGraphProps> = ({ data, onNodeClick }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedNode, setSelectedNode] = useState<any>(null);
  const [filterType, setFilterType] = useState<string | null>(null);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [explorationMode, setExplorationMode] = useState(true);
  const [exploredNodes, setExploredNodes] = useState<Set<string>>(new Set());
  const [zoomLevel, setZoomLevel] = useState(1);
  const [showPulse, setShowPulse] = useState(true);
  const [hubCount, setHubCount] = useState(3);
  const [hiddenTypes, setHiddenTypes] = useState<Set<string>>(new Set());
  const [isPanelMinimized, setIsPanelMinimized] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);
  const [cy, setCy] = useState<cytoscape.Core | null>(null);
  const cyRef = useRef<cytoscape.Core | null>(null);

  const graphData = useMemo(() => {
    const nodes: Record<string, NodeData> = {};
    const edges: EdgeData[] = [];

    const normalizeId = (id: string, type: NodeData['type']) => {
      let clean = id.trim();
      if (type === 'scp') {
        // Normalize SCP designations: "173", "SCP 173", "scp-173" -> "SCP-173"
        let upper = clean.toUpperCase();
        if (/^\d+$/.test(upper)) return `SCP-${upper}`;
        if (upper.startsWith('SCP')) {
          const parts = upper.split(/[\s-]/).filter(Boolean);
          if (parts.length > 1) {
            const numPart = parts.slice(1).join('-');
            return `SCP-${numPart}`;
          }
          // Handle "SCP173"
          const numMatch = upper.match(/^SCP(\d+.*)$/);
          if (numMatch) return `SCP-${numMatch[1]}`;
        }
        return upper;
      }
      return clean;
    };

    const addNode = (id: string, label: string, type: NodeData['type'], subType?: string) => {
      const normalizedId = normalizeId(id, type);
      if (!normalizedId || EXCLUDED_VALUES.includes(normalizedId.toLowerCase())) return null;
      
      if (!nodes[normalizedId]) {
        nodes[normalizedId] = { id: normalizedId, label: label.trim(), type, subType };
      }
      return normalizedId;
    };

    const addEdge = (source: string, target: string, label?: string) => {
      if (!source || !target || source === target) return;
      const id = `${source}-${target}`;
      const reverseId = `${target}-${source}`;
      
      if (!edges.find(e => e.id === id || e.id === reverseId)) {
        edges.push({ id, source, target, label });
      }
    };

    const parseMultiValue = (val: string) => {
      if (!val) return [];
      return val.split(/[;,]/).map(v => {
        const trimmed = v.trim();
        const clean = trimmed.replace(/\s*\(.*?\)\s*/g, '').trim();
        const metadata = trimmed.match(/\((.*?)\)/)?.[1];
        return { clean, metadata };
      }).filter(v => v.clean && !EXCLUDED_VALUES.includes(v.clean.toLowerCase()));
    };

    data.forEach(scp => {
      const scpId = addNode(scp.scp_designation, scp.scp_designation, 'scp');
      if (!scpId) return;

      parseMultiValue(scp.related_scps).forEach(rel => {
        const relId = addNode(rel.clean, rel.clean, 'scp');
        if (relId) addEdge(scpId, relId, rel.metadata);
      });

      parseMultiValue(scp.respective_department).forEach(dept => {
        const deptId = addNode(dept.clean, dept.clean, 'department');
        if (deptId) addEdge(scpId, deptId, dept.metadata);
      });

      const personnelFields: { field: keyof SCPEntry, subType: string }[] = [
        { field: 'involved_doctors', subType: 'Doctor' },
        { field: 'involved_researchers', subType: 'Researcher' },
        { field: 'involved_agents', subType: 'Agent' },
        { field: 'involved_directors', subType: 'Director' }
      ];

      personnelFields.forEach(({ field, subType }) => {
        parseMultiValue(scp[field] as string).forEach(p => {
          const pId = addNode(p.clean, p.clean, 'personnel', subType);
          if (pId) addEdge(scpId, pId, p.metadata);
        });
      });

      parseMultiValue(scp.involved_mobile_task_force).forEach(mtf => {
        const mtfId = addNode(mtf.clean, mtf.clean, 'mtf');
        if (mtfId) addEdge(scpId, mtfId, mtf.metadata);
      });

      parseMultiValue(scp.other_involved_staff).forEach(staff => {
        const staffId = addNode(staff.clean, staff.clean, 'staff');
        if (staffId) addEdge(scpId, staffId, staff.metadata);
      });
    });

    const degreeMap: Record<string, number> = {};
    edges.forEach(e => {
      degreeMap[e.source] = (degreeMap[e.source] || 0) + 1;
      degreeMap[e.target] = (degreeMap[e.target] || 0) + 1;
    });

    Object.keys(nodes).forEach(id => {
      nodes[id].degree = degreeMap[id] || 0;
    });

    return {
      nodes: Object.values(nodes).map(n => ({ data: n })),
      edges: edges.map(e => ({ data: e }))
    };
  }, [data]);

  const elements = useMemo(() => {
    // 1. Determine which nodes/edges should be visible
    let visibleNodeIds = new Set<string>();
    let visibleEdgeIds = new Set<string>();

    if (explorationMode) {
      // Exploration Mode: Start with explored nodes and their immediate neighbors
      // Default to the SCP with the most connections if nothing explored yet
      let seedId = null;
      if (exploredNodes.size === 0 && graphData.nodes.length > 0) {
        const scpNodes = graphData.nodes.filter(n => n.data.type === 'scp');
        const mostConnected = _.maxBy(scpNodes.length > 0 ? scpNodes : graphData.nodes, n => n.data.degree || 0);
        seedId = mostConnected?.data.id || null;
      }

      const currentExplored = exploredNodes.size > 0 
        ? exploredNodes 
        : new Set([seedId].filter(Boolean) as string[]);

      currentExplored.forEach(id => {
        visibleNodeIds.add(id);
        graphData.edges.forEach(e => {
          if (e.data.source === id || e.data.target === id) {
            visibleNodeIds.add(e.data.source);
            visibleNodeIds.add(e.data.target);
            visibleEdgeIds.add(e.data.id);
          }
        });
      });

      // If searching in exploration mode, also show search results
      if (searchTerm) {
        graphData.nodes.forEach(n => {
          if (n.data.label.toLowerCase().includes(searchTerm.toLowerCase())) {
            visibleNodeIds.add(n.data.id);
          }
        });
      }
    } else {
      let filteredNodes = graphData.nodes;
      
      // Filter out hidden types from legend
      filteredNodes = filteredNodes.filter(n => !hiddenTypes.has(n.data.type));
      
      if (filterType) filteredNodes = filteredNodes.filter(n => n.data.type === filterType);
      if (searchTerm) filteredNodes = filteredNodes.filter(n => n.data.label.toLowerCase().includes(searchTerm.toLowerCase()));
      
      filteredNodes = _.sortBy(filteredNodes, n => -(n.data.degree || 0));

      if (!searchTerm && !filterType) {
        filteredNodes = filteredNodes.slice(0, 150);
      }

      const nodeIds = new Set(filteredNodes.map(n => n.data.id));
      
      // Ensure selected node and its immediate neighbors are visible even if not in top 150
      if (selectedNode) {
        visibleNodeIds.add(selectedNode.id);
        graphData.edges.forEach(e => {
          if (e.data.source === selectedNode.id || e.data.target === selectedNode.id) {
            visibleNodeIds.add(e.data.source);
            visibleNodeIds.add(e.data.target);
            visibleEdgeIds.add(e.data.id);
          }
        });
      }

      if (searchTerm) {
        const filteredEdges = graphData.edges.filter(e => nodeIds.has(e.data.source) || nodeIds.has(e.data.target));
        filteredEdges.forEach(e => {
          visibleNodeIds.add(e.data.source);
          visibleNodeIds.add(e.data.target);
          visibleEdgeIds.add(e.data.id);
        });
      } else {
        filteredNodes.forEach(n => visibleNodeIds.add(n.data.id));
        graphData.edges.forEach(e => {
          if (visibleNodeIds.has(e.data.source) && visibleNodeIds.has(e.data.target)) {
            visibleEdgeIds.add(e.data.id);
          }
        });
      }
    }

    // 2. Calculate view degrees for visible nodes
    const viewDegrees: Record<string, number> = {};
    graphData.edges.forEach(e => {
      if (visibleEdgeIds.has(e.data.id)) {
        viewDegrees[e.data.source] = (viewDegrees[e.data.source] || 0) + 1;
        viewDegrees[e.data.target] = (viewDegrees[e.data.target] || 0) + 1;
      }
    });

    const visibleNodesList = graphData.nodes.filter(n => visibleNodeIds.has(n.data.id));
    const sortedVisibleNodes = _.sortBy(visibleNodesList, n => -(viewDegrees[n.data.id] || 0));
    const topHubs = sortedVisibleNodes.slice(0, hubCount);
    const topHubIds = new Set(topHubs.map(n => n.data.id));

    // 3. Map ALL nodes and edges to elements, adding 'hidden' class if not visible
    const finalElements: any[] = [];
    
    graphData.nodes.forEach(n => {
      const isVisible = visibleNodeIds.has(n.data.id);
      const isTopHub = topHubIds.has(n.data.id);
      const vDegree = viewDegrees[n.data.id] || 0;
      
      let classes = isTopHub ? 'top-hub' : (vDegree > 5 ? 'minor-hub' : '');
      if (!isVisible) classes += ' hidden';

      finalElements.push({ 
        ...n, 
        data: { ...n.data, viewDegree: vDegree },
        classes: classes.trim()
      });
    });

    graphData.edges.forEach(e => {
      const isVisible = visibleEdgeIds.has(e.data.id);
      const isTopHubEdge = topHubIds.has(e.data.source) || topHubIds.has(e.data.target);
      
      let wireClasses = isTopHubEdge ? 'wire top-hub-wire' : 'wire';
      let pulseClasses = isTopHubEdge ? 'pulse top-hub-pulse' : 'pulse';
      
      if (!isVisible) {
        wireClasses += ' hidden';
        pulseClasses += ' hidden';
      }

      finalElements.push({
        data: { ...e.data, id: `${e.data.id}-wire` },
        classes: wireClasses.trim()
      });
      
      finalElements.push({
        data: { ...e.data, id: `${e.data.id}-pulse` },
        classes: pulseClasses.trim()
      });
    });

    return finalElements;
  }, [graphData, searchTerm, filterType, selectedNode, hubCount, hiddenTypes, explorationMode, exploredNodes]);

  const stylesheet: any[] = [
    {
      selector: 'node',
      style: {
        'label': (ele: any) => zoomLevel > 0.6 ? ele.data('label') : '',
        'display': (ele: any) => {
          // If zoomed way out, only show hub nodes
          if (zoomLevel < 0.3 && ele.data('degree') < 5) return 'none';
          return 'element';
        },
        'background-color': (ele: any) => {
          const type = ele.data('type');
          return (NODE_COLORS as any)[type] || '#ffffff';
        },
        'width': (ele: any) => {
          const d = ele.data('viewDegree');
          const degree = (typeof d === 'number') ? d : 0;
          return Math.min(100, 30 + degree * 5);
        },
        'height': (ele: any) => {
          const d = ele.data('viewDegree');
          const degree = (typeof d === 'number') ? d : 0;
          return Math.min(100, 30 + degree * 5);
        },
        'font-size': '10px',
        'color': '#ffffff',
        'text-valign': 'center',
        'text-halign': 'center',
        'text-outline-color': '#000000',
        'text-outline-width': '2px',
        'overlay-padding': '0px',
        'overlay-opacity': 0,
        'z-index': 10,
        'transition-property': 'background-color, line-color, target-arrow-color, width, height',
        'transition-duration': 300
      }
    },
    {
      selector: 'node[type="scp"]',
      style: {
        'shape': 'hexagon',
        'border-width': '2px',
        'border-color': '#ffffff'
      }
    },
    {
      selector: '.wire',
      style: {
        'width': 3,
        'line-color': '#2a2a2a', // Slightly lighter for better contrast when zoomed out
        'curve-style': 'bezier',
        'control-point-step-size': 0, // Force overlap with pulse
        'opacity': 0.9,
        'target-arrow-shape': 'none',
        'z-index': 1
      }
    },
    {
      selector: '.pulse',
      style: {
        'width': 3,
        'line-color': '#f8fafc', // Paper White Pulse
        'curve-style': 'bezier',
        'control-point-step-size': 0, // Force overlap with wire
        'line-style': 'dashed',
        'line-dash-pattern': [12, 48], // Adjusted for better visibility
        'line-dash-offset': 0,
        'opacity': 1,
        'target-arrow-shape': 'triangle',
        'target-arrow-color': '#f8fafc',
        'z-index': 2
      }
    },
    {
      selector: '.top-hub-wire',
      style: {
        'width': 6,
        'line-color': '#111111',
        'opacity': 1
      }
    },
    {
      selector: '.top-hub-pulse',
      style: {
        'width': 8,
        'line-color': '#ef4444', // Critical Red Surge
        'line-dash-pattern': [40, 60],
        'opacity': 1,
        'target-arrow-color': '#ef4444',
        'z-index': 3
      }
    },
    {
      selector: '.top-hub',
      style: {
        'border-width': '6px',
        'border-color': '#ef4444',
        'border-style': 'double',
        'z-index': 50
      }
    },
    {
      selector: '.hidden',
      style: {
        'display': 'none'
      }
    },
    {
      selector: ':selected',
      style: {
        'border-width': '4px',
        'border-color': '#ffffff',
        'border-opacity': 1,
        'z-index': 100,
        'width': (ele: any) => {
          if (ele.isNode()) {
            const d = ele.data('viewDegree');
            const degree = (typeof d === 'number') ? d : 0;
            return Math.min(110, 35 + degree * 5);
          }
          return 4;
        },
        'height': (ele: any) => {
          if (ele.isNode()) {
            const d = ele.data('viewDegree');
            const degree = (typeof d === 'number') ? d : 0;
            return Math.min(110, 35 + degree * 5);
          }
          return 4;
        },
      }
    },
    {
      selector: '.highlighted',
      style: {
        'border-width': '4px',
        'border-color': '#ffffff',
        'line-color': '#ffffff',
        'target-arrow-color': '#ffffff',
        'opacity': 1,
        'z-index': 100,
        'width': (ele: any) => {
          if (ele.isEdge()) return 4;
          const d = ele.data('viewDegree');
          const degree = (typeof d === 'number') ? d : 0;
          return Math.min(100, 30 + degree * 5);
        },
        // Only force solid line for non-pulse edges
        'line-style': (ele: any) => {
          if (ele.isEdge() && ele.hasClass('pulse')) return 'dashed';
          return 'solid';
        },
      }
    },
    {
      selector: '.faded',
      style: {
        'opacity': 0.05,
        'text-opacity': 0,
        'events': 'no' // Prevent interaction with faded elements
      }
    }
  ];

  const layoutOptions = useMemo(() => ({
    name: 'fcose',
    animate: true,
    animationDuration: 500,
    randomize: false, // Disable randomization to prevent jumping
    fit: true,
    padding: 50,
    nodeDimensionsIncludeLabels: true,
    uniformNodeDimensions: false,
    packComponents: true,
    nodeRepulsion: 6500,
    idealEdgeLength: 150,
    gravity: 0.2,
    numIter: 2500,
    tiled: true,
  }), []);

  // Manual wheel zoom normalization to handle mouse vs trackpad differences
  useEffect(() => {
    if (!cy) return;

    const container = cy.container();
    if (!container) return;

    const handleWheel = (e: WheelEvent) => {
      // Prevent Cytoscape's default (often erratic) wheel handling
      e.preventDefault();
      e.stopPropagation();

      const currentZoom = cy.zoom();
      const delta = e.deltaY;
      
      // Normalization: Mouse wheels typically send ~100 per notch, trackpads ~1-5.
      // We use an exponential factor for smooth, consistent feel.
      const factor = Math.pow(0.9992, delta);
      let newZoom = currentZoom * factor;

      // Clamp zoom to defined boundaries
      newZoom = Math.max(0.1, Math.min(2, newZoom));

      if (newZoom !== currentZoom) {
        const rect = container.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        cy.zoom({
          level: newZoom,
          renderedPosition: { x, y }
        });
      }
    };

    container.addEventListener('wheel', handleWheel, { passive: false });
    return () => container.removeEventListener('wheel', handleWheel);
  }, [cy]);

  // Pulse animation effect
  useEffect(() => {
    let animationFrame: number;
    let offset = 0;

    const animate = () => {
      if (cyRef.current && showPulse) {
        offset -= 1.5;
        // Apply base pulse to standard energy surges
        cyRef.current.edges('.pulse').style('line-dash-offset', offset);
        // Apply faster, more intense pulse to top hub surges
        cyRef.current.edges('.top-hub-pulse').style('line-dash-offset', offset * 2.5);
      }
      animationFrame = requestAnimationFrame(animate);
    };

    if (showPulse) {
      animationFrame = requestAnimationFrame(animate);
    }

    return () => cancelAnimationFrame(animationFrame);
  }, [showPulse]);

  // Handle layout and events
  useEffect(() => {
    if (cyRef.current) {
      const cy = cyRef.current;
      
      const visibleNodes = cy.nodes(':visible');
      const unpositionedNodes = visibleNodes.filter(n => !n.data('positioned'));
      
      if (unpositionedNodes.length > 0) {
        const positionedNodes = visibleNodes.difference(unpositionedNodes);
        
        // Lock existing nodes so they don't move during layout
        positionedNodes.lock();
        
        // Run layout ONLY on visible nodes
        const l = cy.elements(':visible').layout(layoutOptions as any);
        
        l.on('layoutstop', () => {
          positionedNodes.unlock();
          setIsInitializing(false);
        });
        
        l.run();
        
        // Mark new nodes as positioned
        unpositionedNodes.forEach((n: any) => { n.data('positioned', true); });
      } else {
        // If no unpositioned nodes, we're likely done with initial load
        setIsInitializing(false);
      }

      cy.off('zoom');
      cy.on('zoom', () => {
        setZoomLevel(cy.zoom());
      });
      setZoomLevel(cy.zoom());

      cy.off('tap', 'node');
      cy.on('tap', 'node', (evt) => {
        // Prevent accidental taps during pans by checking if the event was a "pure" tap
        // Cytoscape's 'tap' is already quite good, but we can add a check for the original event
        if (evt.originalEvent.defaultPrevented) return;

        const node = evt.target;
        const nodeData = node.data();
        setSelectedNode(nodeData);
        setIsPanelMinimized(false); // Auto-expand when a new node is selected
        
        if (explorationMode) {
          setExploredNodes(prev => new Set([...prev, nodeData.id]));
        }
      });

      cy.on('tap', (evt) => {
        if (evt.target === cy) {
          setSelectedNode(null);
        }
      });

      return () => {
        cy.off('tap');
      };
    }
  }, [elements, layoutOptions, explorationMode]);

  // Handle highlighting and fading based on selection
  useEffect(() => {
    if (cyRef.current) {
      const cy = cyRef.current;
      if (selectedNode) {
        const node = cy.getElementById(selectedNode.id);
        if (node.length > 0) {
          cy.elements().removeClass('highlighted').addClass('faded');
          node.removeClass('faded').addClass('highlighted');
          node.neighborhood().removeClass('faded').addClass('highlighted');
        }
      } else {
        cy.elements().removeClass('highlighted').removeClass('faded');
      }
    }
  }, [selectedNode, elements, layoutOptions]);

  // Auto-fit when selection changes
  useEffect(() => {
    if (cyRef.current && selectedNode) {
      const cy = cyRef.current;
      const timer = setTimeout(() => {
        // Fit to the selected node and its immediate neighborhood
        const node = cy.getElementById(selectedNode.id);
        if (node.length > 0) {
          cy.fit(node.closedNeighborhood().filter(':visible'), 80);
        }
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [selectedNode]);

  return (
    <div className={`flex flex-col gap-2 sm:gap-4 ${isFullScreen ? 'fixed inset-0 z-[100] bg-black p-4 sm:p-6' : 'h-full'}`}>
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-2 sm:gap-4 bg-black/40 p-2 sm:p-4 border border-white/10 rounded-lg backdrop-blur-md">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-4 flex-1">
          <div className="relative flex-1 min-w-0">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 sm:w-4 sm:h-4 text-foundation-muted" />
            <input 
              type="text"
              placeholder="Search nodes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-black/60 border border-white/10 rounded-md py-1.5 sm:py-2 pl-9 sm:pl-10 pr-4 text-[10px] sm:text-sm font-mono focus:border-foundation-accent outline-none transition-colors"
            />
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Filter className="w-3 h-3 sm:w-4 sm:h-4 text-foundation-muted shrink-0" />
            <select 
              value={filterType || ''}
              onChange={(e) => setFilterType(e.target.value || null)}
              className="w-full sm:w-auto bg-black/60 border border-white/10 rounded-md py-1 sm:py-2 px-2 sm:px-3 text-[10px] sm:text-sm font-mono focus:border-foundation-accent outline-none"
            >
              <option value="">All Entities</option>
              <option value="scp">SCPs</option>
              <option value="personnel">Personnel</option>
              <option value="department">Departments</option>
              <option value="mtf">MTFs</option>
              <option value="staff">Other Staff</option>
            </select>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          <button 
            onClick={() => {
              setExplorationMode(!explorationMode);
              if (!explorationMode) setExploredNodes(new Set());
            }}
            className={`flex items-center gap-2 px-2 sm:px-3 py-1.5 sm:py-2 rounded-md text-[9px] sm:text-[10px] font-mono uppercase tracking-widest transition-all border ${explorationMode ? 'bg-foundation-accent/20 border-foundation-accent text-foundation-accent' : 'bg-black/60 border-white/10 text-foundation-muted hover:text-white'}`}
            title="Toggle Exploration Mode"
          >
            <Zap className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${explorationMode ? 'fill-current' : ''}`} />
            <span className="hidden xs:inline">{explorationMode ? 'Exploration' : 'Global'}</span>
          </button>

          <div className="flex items-center gap-1 bg-black/40 border border-white/10 rounded px-1.5 sm:px-2 py-1">
            <span className="hidden lg:inline text-[10px] font-mono text-foundation-muted uppercase mr-1">Emphasis:</span>
            {[1, 2, 3, 4, 5].map(num => (
              <button
                key={num}
                onClick={() => setHubCount(num)}
                className={`w-7 h-7 sm:w-6 sm:h-6 flex items-center justify-center text-[10px] sm:text-[10px] font-mono rounded transition-all ${hubCount === num ? 'bg-foundation-accent text-white shadow-[0_0_8px_rgba(185,28,28,0.5)]' : 'text-foundation-muted hover:text-white hover:bg-white/5'}`}
              >
                {num}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2">
            <button 
              onClick={() => setShowPulse(!showPulse)}
              className={`p-2 sm:p-2 rounded-md transition-colors ${showPulse ? 'bg-foundation-accent/20 text-foundation-accent' : 'text-foundation-muted hover:bg-white/5'}`}
              title="Toggle Neural Pulse"
            >
              <Activity className={`w-4.5 h-4.5 sm:w-5 sm:h-5 ${showPulse ? 'animate-pulse' : ''}`} />
            </button>
            <button 
              onClick={() => {
                if (cyRef.current) {
                  cyRef.current.nodes().unlock();
                  const l = cyRef.current.elements(':visible').layout({ ...layoutOptions, randomize: true } as any);
                  l.run();
                  cyRef.current.nodes(':visible').forEach((n: any) => { n.data('positioned', true); });
                }
              }}
              className="p-2 sm:p-2 hover:bg-white/5 rounded-md transition-colors text-foundation-muted hover:text-foundation-accent"
              title="Re-run Global Layout"
            >
              <RefreshCw className="w-4.5 h-4.5 sm:w-5 sm:h-5" />
            </button>
            <button 
              onClick={() => {
                if (cyRef.current) {
                  cyRef.current.fit(cyRef.current.elements(':visible'), 50);
                }
              }}
              className="p-2 sm:p-2 hover:bg-white/5 rounded-md transition-colors text-foundation-muted hover:text-foundation-accent"
              title="Fit to View"
            >
              <Focus className="w-4.5 h-4.5 sm:w-5 sm:h-5" />
            </button>
            <button 
              onClick={() => setIsFullScreen(!isFullScreen)}
              className="p-2 sm:p-2 hover:bg-white/5 rounded-md transition-colors text-foundation-muted hover:text-foundation-accent"
              title="Toggle Full Screen"
            >
              {isFullScreen ? <Minimize2 className="w-4.5 h-4.5 sm:w-5 sm:h-5" /> : <Maximize2 className="w-4.5 h-4.5 sm:w-5 sm:h-5" />}
            </button>
          </div>
        </div>
      </div>

      <div className="flex-1 relative border border-white/10 rounded-lg overflow-hidden starfield-bg">
        <AnimatePresence>
          {isInitializing && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 z-[30] bg-black/80 backdrop-blur-sm flex flex-col items-center justify-center gap-4"
            >
              <div className="relative">
                <div className="w-12 h-12 border-2 border-foundation-accent/20 rounded-full" />
                <div className="absolute inset-0 border-t-2 border-foundation-accent rounded-full animate-spin" />
                <Activity className="absolute inset-0 m-auto w-5 h-5 text-foundation-accent animate-pulse" />
              </div>
              <div className="text-center space-y-1">
                <p className="text-[10px] font-mono text-white uppercase tracking-[0.2em] animate-pulse">Synchronizing Nodes</p>
                <p className="text-[8px] font-mono text-foundation-muted uppercase tracking-widest">Calculating Relational Vectors...</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <CytoscapeComponent 
          elements={elements} 
          style={{ width: '100%', height: '100%' }}
          stylesheet={stylesheet}
          layout={layoutOptions}
          cy={(cyInstance) => { 
            cyRef.current = cyInstance;
            setCy(cyInstance);
          }}
          className="cursor-crosshair"
          wheelSensitivity={0} // Disable default wheel handling in favor of our custom normalized handler
          minZoom={0.1}
          maxZoom={2}
        />

        {/* Legend */}
        <div className="absolute top-4 left-4 sm:top-auto sm:bottom-4 p-2 sm:p-3 bg-black/80 border border-white/10 rounded-md backdrop-blur-md space-y-1 sm:space-y-2 z-10 max-w-[100px] sm:max-w-none max-h-[20vh] overflow-y-auto custom-scrollbar">
          <div className="flex items-center justify-between gap-2 sm:gap-4 mb-0.5 sm:mb-2 sticky top-0 bg-black/80 py-0.5">
            <p className="text-[7px] sm:text-[10px] font-mono text-foundation-muted uppercase tracking-widest">Legend</p>
            {hiddenTypes.size > 0 && (
              <button 
                onClick={() => setHiddenTypes(new Set())}
                className="text-[7px] sm:text-[9px] font-mono text-foundation-accent hover:text-white transition-colors uppercase"
              >
                Reset
              </button>
            )}
          </div>
          <div className="grid grid-cols-1 gap-0.5 sm:gap-2">
            {Object.entries(NODE_COLORS).map(([type, color]) => {
              const isHidden = hiddenTypes.has(type);
              return (
                <button 
                  key={type} 
                  onClick={() => {
                    setHiddenTypes(prev => {
                      const next = new Set(prev);
                      if (next.has(type)) next.delete(type);
                      else next.add(type);
                      return next;
                    });
                  }}
                  className={`flex items-center gap-1 sm:gap-2 w-full transition-all duration-300 hover:translate-x-1 ${isHidden ? 'opacity-30 grayscale' : 'opacity-100'}`}
                >
                  <div className="w-1.5 h-1.5 sm:w-3 sm:h-3 rounded-full shadow-[0_0_5px_rgba(0,0,0,0.5)]" style={{ backgroundColor: color }} />
                  <span className={`text-[7px] sm:text-[10px] font-mono uppercase tracking-wider truncate ${isHidden ? 'text-foundation-muted' : 'text-white'}`}>
                    {type}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Node Info Panel */}
        <AnimatePresence>
          {selectedNode && (
            <motion.div 
              initial={{ y: 100, opacity: 0 }}
              animate={{ 
                y: 0, 
                opacity: 1,
                height: isPanelMinimized ? 'auto' : 'auto' // Let content drive height
              }}
              exit={{ y: 100, opacity: 0 }}
              className={`absolute bottom-4 left-4 right-4 sm:bottom-auto sm:top-4 sm:right-4 sm:left-auto sm:w-80 bg-black/95 border border-foundation-accent/30 rounded-lg backdrop-blur-xl shadow-2xl z-20 p-4 sm:p-5 overflow-y-auto transition-all duration-300 ${isPanelMinimized ? 'max-h-[60px] sm:max-h-[80px]' : 'max-h-[35vh] sm:max-h-[calc(100%-2rem)]'}`}
            >
              <div className="flex justify-between items-start mb-3 sm:mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: NODE_COLORS[selectedNode.type as keyof typeof NODE_COLORS] }} />
                  <span className="text-[9px] sm:text-[10px] font-mono text-foundation-muted uppercase tracking-widest">{selectedNode.type}</span>
                </div>
                <div className="flex items-center gap-1">
                  <button 
                    onClick={() => setIsPanelMinimized(!isPanelMinimized)}
                    className="p-1 text-foundation-muted hover:text-white transition-colors sm:hidden"
                    title={isPanelMinimized ? "Expand" : "Minimize"}
                  >
                    {isPanelMinimized ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </button>
                  <button 
                    onClick={() => {
                      setSelectedNode(null);
                      if (cyRef.current) {
                        cyRef.current.elements().removeClass('highlighted').removeClass('faded');
                      }
                    }} 
                    className="p-1 text-foundation-muted hover:text-white transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {!isPanelMinimized && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="space-y-3 sm:space-y-4"
                >
                  <h4 className="text-base sm:text-lg font-bold terminal-text mb-1 sm:mb-2 line-clamp-2">{selectedNode.label}</h4>
                  {selectedNode.subType && (
                    <p className="text-[10px] sm:text-xs font-mono text-foundation-accent uppercase mb-3 sm:mb-4">{selectedNode.subType}</p>
                  )}

                  <div className="space-y-3 sm:space-y-4">
                    <div className="p-2 sm:p-3 bg-white/5 rounded border border-white/5">
                      <p className="text-[9px] sm:text-[10px] font-mono text-foundation-muted uppercase mb-1">Local Connectivity</p>
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-1 bg-white/10 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-foundation-accent" 
                            style={{ width: `${Math.min(100, (selectedNode.viewDegree / 10) * 100)}%` }} 
                          />
                        </div>
                        <span className="text-xs font-mono text-white">{selectedNode.viewDegree}</span>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      {selectedNode.type === 'scp' && (
                        <button 
                          onClick={() => onNodeClick ? onNodeClick(selectedNode.id) : (window.location.href = `/scp/${selectedNode.id}`)}
                          className="flex-1 py-2 bg-foundation-accent/20 hover:bg-foundation-accent/40 border border-foundation-accent/40 rounded text-[10px] font-mono text-foundation-accent uppercase tracking-widest transition-all"
                        >
                          Dossier
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="mt-4 sm:mt-6 pt-4 sm:pt-6 border-t border-white/10">
                    <p className="text-[9px] sm:text-[10px] font-mono text-foundation-muted uppercase mb-2 sm:mb-3">Local Connections</p>
                    <div className="space-y-1.5 sm:space-y-2">
                      {elements
                        .filter(e => 'source' in e.data && (e.data.source === selectedNode.id || e.data.target === selectedNode.id) && e.classes?.includes('wire'))
                        .map((e: any) => {
                          const otherId = e.data.source === selectedNode.id ? e.data.target : e.data.source;
                          return (
                            <div key={e.data.id} className="flex items-center justify-between text-[9px] sm:text-[10px] font-mono text-white/60 p-1.5 sm:p-2 hover:bg-white/5 rounded transition-colors">
                              <span className="truncate mr-2">{otherId}</span>
                              {e.data.label && <span className="text-foundation-muted italic shrink-0">({e.data.label})</span>}
                            </div>
                          );
                        })}
                    </div>
                  </div>
                </motion.div>
              )}
              
              {isPanelMinimized && (
                <div className="flex items-center gap-3">
                  <h4 className="text-xs font-bold terminal-text truncate flex-1">{selectedNode.label}</h4>
                  <div className="w-1.5 h-1.5 rounded-full bg-foundation-accent animate-pulse" />
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
