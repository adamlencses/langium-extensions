import { ValidationAcceptor, ValidationChecks } from "langium";
import { ShapeAstType, Model } from "./generated/ast";
import type { ShapeServices } from "./shape-module";

/**
 * Register custom validation checks.
 */
export function registerValidationChecks(services: ShapeServices) {
  const registry = services.validation.ValidationRegistry;
  const validator = services.validation.ShapeValidator;
  const checks: ValidationChecks<ShapeAstType> = {
    Model: validator.checkUniqueShapeNames,
  };
  registry.register(checks, validator);
}

/**
 * Implementation of custom validations.
 */
export class ShapeValidator {
  checkUniqueShapeNames(model: Model, accept: ValidationAcceptor): void {
    // create a set of visited shapes
    // and report an error when we see one we've already seen
    const reported = new Set();
    model.shapes.forEach((shape) => {
      if (reported.has(shape.name)) {
        accept("error", `Shape has non-unique name '${shape.name}'.`, { node: shape, property: "name" });
      }
      reported.add(shape.name);
    });
  }
}
