grammar Workflow

entry Model:
    (nodes+=Node | edges+=Edge)*;

Node:
    (TaskNode | Category | ActivityNode);

TaskNode:
    'TaskNode' name=STRING (expanded?='expanded')? duration=INT taskType=TaskType (reference=STRING)? ';';

Category:
    'Category' name=STRING ('{' children+=Node '}')? ';';

ActivityNode:
    'ActivityNode' name=STRING nodeType=NodeType ';';

TaskType returns string:
    'automated' | 'manual';

NodeType returns string:
    'decision' | 'fork' | 'join' | 'merge';

Edge:
    (source=[Node] '->' target=[Node] ';') | WeigtedEdge;

WeigtedEdge:
    (source=[Node] '->' probability=STRING target=[Node] ';'); 

hidden terminal WS: /\s+/;
terminal BOOLEAN: /true|false/;
terminal ID: /[0-9a-fA-F]{8}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{12}/;
terminal INT returns number: /[0-9]+/;
terminal STRING: /"(\\.|[^"\\])*"|'(\\.|[^'\\])*'/;

hidden terminal ML_COMMENT: /\/\*[\s\S]*?\*\//;
hidden terminal SL_COMMENT: /\/\/[^\n\r]*/;
