/********************************************************************************
 * Copyright (c) 2023 CrossBreeze.
 ********************************************************************************/

import { AstNode, isAstNode } from 'langium';
import { TextDocument } from 'vscode-languageserver-textdocument';
import { URI } from 'vscode-uri';
import { WorkflowDiagramSharedServices } from '../../language/workflow-diagram-module';

/**
 * The model service serves as a facade to access and update semantic models from the language server as a non-LSP client.
 * It provides a simple open-request-update-save/close lifecycle for documents and their semantic model.
 */
export class ModelService {
   constructor(
      protected shared: WorkflowDiagramSharedServices,
      protected documentManager = shared.workspace.TextDocumentManager,
      protected documents = shared.workspace.LangiumDocuments,
      protected documentBuilder = shared.workspace.DocumentBuilder,
      protected indexManager = shared.workspace.IndexManager
   ) {
      
   }

   /**
    * Opens the document with the given URI for modification.
    *
    * @param uri document URI
    */
   async open(uri: string): Promise<void> {
      return this.documentManager.open(uri);
   }

   /**
    * Closes the document with the given URI for modification.
    *
    * @param uri document URI
    */
   async close(uri: string): Promise<void> {
      return this.documentManager.close(uri);
   }

   /**
    * Requests the semantic model stored in the document with the given URI.
    * If the document was not already open for modification, it will be opened automatically.
    *
    * @param uri document URI
    */
   request(uri: string): Promise<AstNode | undefined>;
   /**
    * Requests the semantic model stored in the document with the given URI if it matches the given guard function.
    * If the document was not already open for modification, it will be opened automatically.
    *
    * @param uri document URI
    * @param guard guard function to ensure a certain type of semantic model
    */
   request<T extends AstNode>(uri: string, guard: (item: unknown) => item is T): Promise<T | undefined>;
   async request<T extends AstNode>(uri: string, guard?: (item: unknown) => item is T): Promise<AstNode | T | undefined> {
      this.open(uri);
      const document = this.documents.getOrCreateDocument(URI.parse(uri));
      const root = document.parseResult.value;
      const check = guard ?? isAstNode;
      return check(root) ? root : undefined;
   }

   async getCrossReferences(uri: string, ref: string): Promise<AstNode[] | undefined> {
      this.open(uri);
      const document = this.documents.getOrCreateDocument(URI.parse(uri));
      await this.indexManager.updateContent(document);
      await this.indexManager.updateReferences(document);
      const builderResult = await this.documentBuilder.build([document])
      console.log(builderResult)
      const references: AstNode[] = [];
      console.log(document.state)
      console.log(document.references)
      console.log(document.parseResult.value)
      document.references.forEach(reference => {
         if (reference.$nodeDescription?.name === ref) {
            if (reference.$nodeDescription.node) {
               references.push(reference.$nodeDescription.node )
            }
         } 
         console.log(reference.$nodeDescription)
      })
      return references;
   }

   /**
    * Updates the semantic model stored in the document with the given model or textual representation of a model.
    * Any previous content will be overridden.
    * If the document was not already open for modification, it will be opened automatically.
    *
    * @param uri document URI
    * @param model semantic model or textual representation of it
    * @returns the stored semantic model
    */
   async update<T extends AstNode>(uri: string, model: T | string): Promise<T> {
      await this.open(uri);
      const document = this.documents.getOrCreateDocument(URI.parse(uri));
      const root = document.parseResult.value;
      if (!isAstNode(root)) {
         throw new Error(`No AST node to update exists in '${uri}'`);
      }

      const text = typeof model === 'string' ? model : this.serialize(URI.parse(uri), model);
      const version = document.textDocument.version + 1;

      TextDocument.update(document.textDocument, [{ text }], version);
      await this.documentManager.update(uri, version, text);
      await this.documentBuilder.update([URI.parse(uri)], []);

      return document.parseResult.value as T;
   }

   /**
    * Overrides the document with the given URI with the given semantic model or text.
    *
    * @param uri document uri
    * @param model semantic model or text
    */
   async save(uri: string, model: AstNode | string): Promise<void> {
      const text = typeof model === 'string' ? model : this.serialize(URI.parse(uri), model);
      return this.documentManager.save(uri, text);
   }

   /**
    * Serializes the given semantic model by using the serializer service for the corresponding language.
    *
    * @param uri document uri
    * @param model semantic model
    */
   protected serialize(uri: URI, model: AstNode): string {
      const serializer = this.shared.ServiceRegistry.getServices(uri).serializer.Serializer;
      return serializer.serialize(model);
   }
}