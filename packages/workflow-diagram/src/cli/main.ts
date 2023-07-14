import chalk from 'chalk';
import { Command } from 'commander';
import { Model } from '../language/generated/ast';
import { WorkflowDiagramLanguageMetaData } from '../language/generated/module';
import { createWorkflowDiagramServices } from '../language/workflow-diagram-module';
import { extractAstNode } from './cli-util';
import { generateJavaScript } from './generator';
import { NodeFileSystem } from 'langium/node';
import { parseAndValidate } from './parseAndValidate';

export const generateAction = async (fileName: string, opts: GenerateOptions): Promise<void> => {
    const services = createWorkflowDiagramServices(NodeFileSystem).WorkflowDiagram;
    const model = await extractAstNode<Model>(fileName, services);
    const generatedFilePath = generateJavaScript(model, fileName, opts.destination);
    console.log(chalk.green(`JavaScript code generated successfully: ${generatedFilePath}`));
};

export type GenerateOptions = {
    destination?: string;
}

export default function(): void {
    const program = new Command();

    program
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        .version(require('../../package.json').version);

    const fileExtensions = WorkflowDiagramLanguageMetaData.fileExtensions.join(', ');
    program
        .command('generate')
        .argument('<file>', `source file (possible file extensions: ${fileExtensions})`)
        .option('-d, --destination <dir>', 'destination directory of generating')
        .description('generates JavaScript code that prints "Hello, {name}!" for each greeting in a source file')
        .action(generateAction);
    program
        .command('parseAndValidate')
        .argument('<file>', 'Source file to parse & validate (ending in ${fileExtensions})')
        .description('Indicates where a program parses & validates successfully, but produces no output code')
        .action(parseAndValidate) // we'll need to implement this function

    program.parse(process.argv);
}
