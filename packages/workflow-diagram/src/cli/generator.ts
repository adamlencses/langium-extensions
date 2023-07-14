import fs from 'fs';
import { CompositeGeneratorNode, NL, toString } from 'langium';
import path from 'path';
import { Model } from '../language/generated/ast';
import { extractDestinationAndName } from './cli-util';

export function generateJavaScript(model: Model, filePath: string, destination: string | undefined): string {
    const data = extractDestinationAndName(filePath, destination);
    const generatedFilePath = `${path.join(data.destination, data.name)}.js`;

    const fileNode = new CompositeGeneratorNode();
    fileNode.append('"use strict";', NL, NL);
    // model.nodes.forEach(node => fileNode.append(`console.log('Hello, ${node.name}!');`, NL));
    // model.edges.forEach(edge => fileNode.append(`console.log('Edge from ${edge.src.ref?.name} to ${edge.tgt.ref?.name}!');`, NL));

    if (!fs.existsSync(data.destination)) {
        fs.mkdirSync(data.destination, { recursive: true });
    }
    fs.writeFileSync(generatedFilePath, toString(fileNode));
    return generatedFilePath;
}
