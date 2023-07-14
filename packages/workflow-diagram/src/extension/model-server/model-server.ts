/********************************************************************************
 * Copyright (c) 2023 CrossBreeze.
 ********************************************************************************/

import { AstNode, isReference } from 'langium';
import { Disposable } from 'vscode-jsonrpc';
import * as rpc from 'vscode-jsonrpc/node';
import { ModelService } from './model-service';
import { Model, isModel } from '../../language/generated/ast';

export const OpenModel = new rpc.RequestType1<string, void, void>('server/open');
export const CloseModel = new rpc.RequestType1<string, void, void>('server/close');
export const RequestModel = new rpc.RequestType1<string, Model | undefined, void>('server/request');
export const UpdateModel = new rpc.RequestType2<string, Model, void, void>('server/update');
export const SaveModel = new rpc.RequestType2<string, Model, void, void>('server/save');
export const ReferenceModel = new rpc.RequestType2<string, Model, void, void>('server/references');

/**
 * The model server handles request messages on the RPC connection and ensures that any return value
 * can be sent to the client by ensuring proper serialization of semantic models.
 */
export class ModelServer implements Disposable {
   protected toDispose: Disposable[] = [];

   constructor(protected connection: rpc.MessageConnection, protected modelService: ModelService) {
      this.initialize(connection);
   }

   protected initialize(connection: rpc.MessageConnection): void {
      this.toDispose.push(connection.onRequest(OpenModel, (uri: any) => this.openModel(uri)));
      this.toDispose.push(connection.onRequest(CloseModel, (uri: any) => this.closeModel(uri)));
      this.toDispose.push(connection.onRequest(RequestModel, (uri: any) => this.requestModel(uri)));
      this.toDispose.push(connection.onRequest(ReferenceModel, (uri: any, ref: any) => this.getReferences(uri, ref)));
      this.toDispose.push(connection.onRequest(UpdateModel, (uri: any, model: any) => this.updateModel(uri, model)));
      this.toDispose.push(connection.onRequest(SaveModel, (uri: any, model: any) => this.saveModel(uri, model)));
   }

   protected async openModel(uri: string): Promise<void> {
      await this.modelService.open(uri);
   }

   protected async closeModel(uri: string): Promise<void> {
      await this.modelService.close(uri);
   }

   protected async requestModel(uri: string): Promise<Model | undefined> {
      const root = await this.modelService.request(uri, isModel);
      return toSerializable(root) as Model;
   }

   protected async updateModel(uri: string, model: AstNode): Promise<void> {
      await this.modelService.update(uri, model);
   }

   protected async saveModel(uri: string, model: AstNode): Promise<void> {
      await this.modelService.save(uri, model);
   }

   protected async getReferences(uri: string, reference: string): Promise<any> {
      return toSerializable(this.modelService.getCrossReferences(uri, reference));
   }

   dispose(): void {
      this.toDispose.forEach(disposable => disposable.dispose());
   }
}

/**
 * Cleans the semantic object of any property that cannot be serialized as a String and thus cannot be sent to the client
 * over the RPC connection.
 *
 * @param obj semantic object
 * @returns serializable semantic object
 */
export function toSerializable<T extends object>(obj?: T): T | undefined {
   if (!obj) {
      return;
   }
   // We remove all $<property> from the semantic object with the exception of type
   // they are added by Langium but have no additional value on the client side
   // Furtermore we ensure that for references we use their string representation ($refText)
   // instead of their real value to avoid sending whole serialized object graphs
   return <T>Object.entries(obj)
      .filter(([key, value]) => !key.startsWith('$') || key === '$type')
      .reduce((acc, [key, value]) => ({ ...acc, [key]: cleanValue(value) }), {});
}

function cleanValue(value: any): any {
   return isContainedObject(value) ? toSerializable(value) : resolvedValue(value);
}

function isContainedObject(value: any): boolean {
   return value === Object(value) && !isReference(value);
}

function resolvedValue(value: any): any {
   if (isReference(value)) {
      return value.$refText;
   }
   return value;
}