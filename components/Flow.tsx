import ReactFlow, {
  Node,
  useNodesState,
  Edge,
  ConnectionLineType,
  useEdgesState,
  MarkerType,
  MiniMap,
  Controls,
  Background,
  Panel,
  useReactFlow,
} from 'reactflow';
import PromptNode from './PromptNode';
import ChatNode from './ChatNode';
import ConfusedNode from './ConfusedNode';
import QuestionNode from './QuestionNode';
import { useCallback, useMemo, useState } from 'react';
import { Button } from './ui/button';
import Link from 'next/link';
import ApiKeyDialog from './ApiKeyDialog';
import SaveSessionButton from './SaveSessionButton';

const flowKey = 'example-flow';

export const initialNodes: Node[] = [
  {
    id: '1',
    type: 'quizNode',
    data: {
      question: 'Ask me anything CS related.',
    },
    position: { x: 0, y: 0 },
  },

  // {
  //   id: '2',
  //   type: 'promptNode',
  //   //This node is mostly 400px on avg
  //   position: { x: 300, y: -250 },
  //   data: {
  //     topic: 'Linked Lists',
  //     description:
  //       'A linked list is a linear data structure where each element is a separate object. Each element (node) of a list consists of two items - the data and a reference to the next node. The last node has a reference to null. The entry point into a linked list is called the head of the list. It should be noted that head is not a separate node, but the reference to the first node. If the list is empty then the head is a null reference.',
  //     subtopics: [
  //       'Singly Linked List',
  //       'Doubly Linked List',
  //       'Circular Linked List',
  //       'Operations on Linked List',
  //     ],
  //     questions: [
  //       { q: 'What is a node in a linked list?', a: 'ik' },
  //       { q: 'What is a node in a linked ?', a: 'id' },
  //       { q: 'What is a node in a li?', a: 'i' },
  //       { q: 'What is a node in ?', a: 'k' },
  //     ],
  //     im_confused: [
  //       'Node',
  //       'Head',
  //       'Types of Linked Lists',
  //       'Operations on Linked List',
  //     ],
  //   },
  // },
  // {
  //   id: '3',
  //   type: 'questionNode',
  //   position: { x: 700, y: 0 },
  //   data: {
  //     q: 'Question?',
  //     a: 'Some answer',
  //   },
  // },
];

const initialEdges: Edge[] = [
  { id: 'edge-1', source: '1', target: '2' },
  { id: 'edge-2', source: '1', target: '2' },
  { id: 'edge-3', source: '2', target: '3' },
];

// const initialEdges: Edge[] = [];

export default function Flow({ ...rest }) {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  //TODO: make a PR for better example
  const [rfInstance, setRfInstance] = useState(useReactFlow());
  const { setViewport } = useReactFlow();
  const nodeTypes = useMemo(
    () => ({
      promptNode: PromptNode,
      quizNode: ChatNode,
      confusedNode: ConfusedNode,
      questionNode: QuestionNode,
    }),
    []
  );
  const defaultEdgeOptions = useMemo(
    () => ({
      markerEnd: {
        type: MarkerType.ArrowClosed,
        width: 20,
        height: 20,
        color: '#000000',
      },
      // label: 'label an edge',
      style: {
        strokeWidth: 2,
        stroke: '#000000',
      },
    }),
    []
  );
  const onSave = useCallback(() => {
    if (rfInstance) {
      const flow = rfInstance.toObject();
      const sessionJson = JSON.stringify(flow);

      const blob = new Blob([sessionJson], { type: 'application/json' });

      const url = URL.createObjectURL(blob);

      const link = document.createElement('a');
      link.href = url;
      link.download = 'knode-session.json';

      link.click();
      localStorage.setItem(flowKey, flow as any);
    }
  }, [rfInstance]);

  const onRestore = useCallback(() => {
    const restoreFlow = async () => {
      //@ts-expect-error
      const flow = JSON.parse(localStorage.getItem(flowKey));

      if (flow) {
        const { x = 0, y = 0, zoom = 1 } = flow.viewport;
        setNodes(flow.nodes || []);
        setEdges(flow.edges || []);
        setViewport({ x, y, zoom });
      }
    };

    restoreFlow();
  }, [setNodes, setViewport]);

  return (
    <ReactFlow
      onInit={setRfInstance}
      className='w-full h-full'
      nodes={nodes}
      onNodesChange={onNodesChange}
      edges={edges}
      // onEdgesChange={onEdgesChange}
      // onConnect={onConnect}
      nodeTypes={nodeTypes}
      defaultEdgeOptions={defaultEdgeOptions}
      connectionLineType={ConnectionLineType.SmoothStep}
      fitView
      {...rest}
    >
      <Panel position='top-right'>
        <div className='flex space-x-2 flex-row'>
          {/* <ApiKeyDialog />
          <SaveSessionButton /> */}
          <button onClick={onSave}>save</button>
          <button onClick={onRestore}>restore</button>
        </div>
      </Panel>
      <Panel position='top-left'>
        <Link target='_blank' className='hover:underline' href={'/'}>
          😇 Enjoying knode? Help us with this short Google Form &rarr;
        </Link>
      </Panel>
      <Controls />
      <Background color='#aaa' />
      <MiniMap />
    </ReactFlow>
  );
}
