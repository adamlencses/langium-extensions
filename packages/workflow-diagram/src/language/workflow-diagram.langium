grammar WorkflowDiagram

entry Model:
    (nodes+=Node | edges+=Edge)*;


Node: AutomatedTask | ManualTask | Category | DecisionNode | ForkNode | JoinNode | MergeNode;

AutomatedTask: 'auto' 'task' name=ID;
ManualTask: 'manual' 'task' name=ID;
Category: 'category' name=ID;
DecisionNode: 'decision' name='decision';
ForkNode: 'fork' name='fork';
JoinNode: 'join' name='join';
MergeNode: 'merge' name='merge';

Edge: 'edge' (DefaultEdge | WeightedEdge);

DefaultEdge: EdgeConnector;
WeightedEdge: weight=INT EdgeConnector;


fragment EdgeConnector: source=[Node] target=[Node];

hidden terminal WS: /\s+/;
terminal ID: /[_a-zA-Z][\w_]*/;
terminal INT returns number: /[0-9]+/;

hidden terminal ML_COMMENT: /\/\*[\s\S]*?\*\//;
hidden terminal SL_COMMENT: /\/\/[^\n\r]*/;
