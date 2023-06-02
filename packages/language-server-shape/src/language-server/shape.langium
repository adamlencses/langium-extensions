grammar Shape

entry Model:
    (shapes+=Shape | connections+=Connection)*;

Shape:
    Circle | Rectangle;

Circle:
    'Circle' name=ID Details;

Rectangle:
    'Rectangle' name=ID Details;

Connection:
    source=[Shape] '->' target =[Shape];

fragment Details:
    color=HEX (x=DECIMAL y=DECIMAL)? (width=DECIMAL height=DECIMAL)?;

hidden terminal WS: /\s+/;
terminal ID: /[_a-zA-Z][\w_]*/;
terminal HEX: /\#[0-9a-fA-F]{6}/;
terminal DECIMAL returns number: /[0-9]+\.?[0-9]*/;
terminal STRING: /"(\\.|[^"\\])*"|'(\\.|[^'\\])*'/;

hidden terminal ML_COMMENT: /\/\*[\s\S]*?\*\//;
hidden terminal SL_COMMENT: /\/\/[^\n\r]*/;
