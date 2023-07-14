/********************************************************************************
 * Copyright (c) 2023 CrossBreeze.
 ********************************************************************************/

import * as fs from 'fs';
import { FileSystemProvider, LangiumDefaultSharedServices } from 'langium';
import { TextDocumentIdentifier, TextDocumentItem, VersionedTextDocumentIdentifier } from 'vscode-languageserver-protocol';
import { TextDocument } from 'vscode-languageserver-textdocument';
import { URI } from 'vscode-uri';
import { AddedSharedModelServices } from './model-module';
import { OpenableTextDocuments } from './openable-text-documents';

/**
 * A manager class that suppors handling documents with a simple open-update-save/close lifecycle.
 *
 * The manager wraps the services exposed by Langium and acts as a small language client on behalf of the caller.
 */
export class OpenTextDocumentManager {
   protected textDocuments: OpenableTextDocuments<TextDocument>;
   protected fileSystemProvider: FileSystemProvider;

   /** Normalized URIs of open documents */
   protected openDocuments: string[] = [];

   constructor(services: AddedSharedModelServices & LangiumDefaultSharedServices) {
      this.textDocuments = services.workspace.TextDocuments;
      this.fileSystemProvider = services.workspace.FileSystemProvider;
      this.textDocuments.onDidOpen((event: any) => this.open(event.document.uri, event.document.languageId));
      this.textDocuments.onDidClose((event: any) => this.close(event.document.uri));
   }

   async open(uri: string, languageId?: string): Promise<void> {
      if (this.isOpen(uri)) {
         return;
      }
      this.openDocuments.push(this.normalizedUri(uri));
      const textDocument = await this.readFromFilesystem(uri, languageId);
      this.textDocuments.notifyDidOpenTextDocument({ textDocument });
   }

   async close(uri: string): Promise<void> {
      if (!this.isOpen(uri)) {
         return;
      }
      this.removeFromOpenedDocuments(uri);
      this.textDocuments.notifyDidCloseTextDocument({ textDocument: TextDocumentIdentifier.create(uri) });
   }

   async update(uri: string, version: number, text: string): Promise<void> {
      if (!this.isOpen(uri)) {
         throw new Error(`Document ${uri} hasn't been opened for updating yet`);
      }
      this.textDocuments.notifyDidChangeTextDocument({
         textDocument: VersionedTextDocumentIdentifier.create(uri, version),
         contentChanges: [{ text }]
      });
   }

   async save(uri: string, text: string): Promise<void> {
      const vscUri = URI.parse(uri);
      fs.writeFileSync(vscUri.fsPath, text);
      this.textDocuments.notifyDidSaveTextDocument({ textDocument: TextDocumentIdentifier.create(uri) });
   }

   protected isOpen(uri: string): boolean {
      return this.openDocuments.includes(this.normalizedUri(uri));
   }

   protected removeFromOpenedDocuments(uri: string): void {
      this.openDocuments.splice(this.openDocuments.indexOf(this.normalizedUri(uri)));
   }

   protected async readFromFilesystem(uri: string, languageId = 'cross-model'): Promise<TextDocumentItem> {
      const vscUri = URI.parse(uri);
      const content = this.fileSystemProvider.readFileSync(vscUri);
      return TextDocumentItem.create(vscUri.toString(), languageId, 1, content.toString());
   }

   protected normalizedUri(uri: string): string {
      return URI.parse(uri).toString();
   }
}