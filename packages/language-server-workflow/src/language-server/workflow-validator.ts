import { ValidationAcceptor, ValidationChecks } from "langium";
import { WorkflowAstType, WeigtedEdge, ActivityNode } from "./generated/ast";
import type { WorkflowServices } from "./workflow-module";

/**
 * Register custom validation checks.
 */
export function registerValidationChecks(services: WorkflowServices) {
  const registry = services.validation.ValidationRegistry;
  const validator = services.validation.WorkflowValidator;
  const checks: ValidationChecks<WorkflowAstType> = {
    WeigtedEdge: validator.checkWeigtedEdgeStartsFromDecisionNode,
  };
  registry.register(checks, validator);
}

/**
 * Implementation of custom validations.
 */
export class WorkflowValidator {
  checkWeigtedEdgeStartsFromDecisionNode(weigtedEdge: WeigtedEdge, accept: ValidationAcceptor): void {
    if (weigtedEdge.source.ref?.$type === "ActivityNode") {
      const sourceNode: ActivityNode = weigtedEdge.source.ref as ActivityNode;
      if (sourceNode.nodeType !== "decision") {
        accept("error", "WeightedEdge source must be a decision node.", { node: weigtedEdge, property: "source" });
      }
    } else {
      accept("error", "WeightedEdge source must be a decision node.", { node: weigtedEdge, property: "source" });
    }
  }
}
