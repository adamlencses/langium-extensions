/********************************************************************************
 * Copyright (c) 2023 CrossBreeze.
 ********************************************************************************/

import { AstNode, AstNodeDescription, DefaultScopeComputation, LangiumDocument, streamAllContents } from 'langium';
import { CancellationToken } from 'vscode-jsonrpc';
import { isModel } from './generated/ast';
import { WorkflowDiagramServices } from './workflow-diagram-module';

/**
 * Custom node description that wraps a given description under a potentially new name and also stores the package id for faster access.
 */
export class PackageAstNodeDescription implements AstNodeDescription {
   constructor(
      public packageId: string,
      public name: string,
      public delegate: AstNodeDescription,
      public node = delegate.node,
      public nameSegment = delegate.nameSegment,
      public selectionSegment = delegate.selectionSegment,
      public type = delegate.type,
      public documentUri = delegate.documentUri,
      public path = delegate.path
   ) {}
}

/**
 * Custom class to represent package-local descriptions without the package name so we can do easier instanceof checks.
 */
export class PackageLocalAstNodeDescription extends PackageAstNodeDescription {
   constructor(packageName: string, name: string, delegate: AstNodeDescription) {
      super(packageName, name, delegate);
   }
}

/**
 * Custom class to represent package-external descriptions with the package name so we can do easier instanceof checks.
 */
export class PackageExternalAstNodeDescription extends PackageAstNodeDescription {
   constructor(packageName: string, name: string, delegate: AstNodeDescription) {
      super(packageName, name, delegate);
   }
}

export function isExternalDescriptionForLocalPackage(description: AstNodeDescription, packageId?: string): boolean {
   return packageId !== undefined && description instanceof PackageExternalAstNodeDescription && description.packageId === packageId;
}

/**
 * A scope computer that performs the following customizations:
 * - Avoid exporting any nodes from diagrams, they are self-contained and do not need to be externally accessible.
 * - Store the package id for each node so we can do faster dependency calculation.
 * - Export nodes twice: Once for external usage with the fully-qualified name and once for package-local usage.
 */
export class WorkflowDiagramScopeComputation extends DefaultScopeComputation {

   constructor(services: WorkflowDiagramServices) {
      super(services);
   }

   // overridden because we use 'streamAllContents' as children retrieval instead of 'streamContents'
   override async computeExportsForNode(
      parentNode: AstNode,
      document: LangiumDocument<AstNode>,
      children: (root: AstNode) => Iterable<AstNode> = streamAllContents,
      cancelToken: CancellationToken = CancellationToken.None
   ): Promise<AstNodeDescription[]> {
      const docRoot = document.parseResult.value;
      if (isModel(docRoot)) {
         // we do not export anything from diagrams, they are self-contained
         return [];
      }
      return super.computeExportsForNode(parentNode, document, children, cancelToken);
   }
}