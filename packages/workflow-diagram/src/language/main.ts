import { startLanguageServer } from 'langium';
import { NodeFileSystem } from 'langium/node';
import { createConnection, ProposedFeatures } from 'vscode-languageserver/node';
import { createWorkflowDiagramServices } from './workflow-diagram-module';
import { startModelServer } from '../extension/model-server/launch';

// Create a connection to the client
const connection = createConnection(ProposedFeatures.all);

// Inject the shared services and language-specific services
const { shared, WorkflowDiagram } = createWorkflowDiagramServices({ connection, ...NodeFileSystem });

// Start the language server with the shared services
startLanguageServer(shared);

shared.workspace.WorkspaceManager.onWorkspaceInitialized(() => {
    startModelServer({shared, language: WorkflowDiagram})
})