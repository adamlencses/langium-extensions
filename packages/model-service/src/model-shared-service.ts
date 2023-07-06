import { AstNode, DefaultServiceRegistry, JsonSerializer, LangiumServices, LangiumSharedServices, ServiceRegistry } from "langium";
import { AddedSharedModelServices } from "./model-module";
import {Serializer} from './serializer'
import { URI } from "vscode-uri";
import { ModelServiceWorkspaceManager } from "./model-service-workspace-manager";

/***************************
 * Shared Module
 ***************************/
export interface ExtendedLangiumServices extends LangiumServices {
    serializer: {
       JsonSerializer: JsonSerializer;
       Serializer: Serializer<AstNode>;
    };
 }
 
 export class ExtendedServiceRegistry extends DefaultServiceRegistry {
    override register(language: ExtendedLangiumServices): void {
       super.register(language);
    }
 
    override getServices(uri: URI): ExtendedLangiumServices {
       return super.getServices(uri) as ExtendedLangiumServices;
    }
 }
 
 export interface ExtendedServiceRegistry extends ServiceRegistry {
    register(language: ExtendedLangiumServices): void;
    getServices(uri: URI): ExtendedLangiumServices;
 }

export type AddedSharedServices = {
    ServiceRegistry: ExtendedServiceRegistry,
    workspace: {
        WorkspaceManager: ModelServiceWorkspaceManager
    }
}

export const SharedServices = Symbol("SharedServices");
export type SharedServices = Omit<LangiumSharedServices, 'ServiceRegistry'> &
    AddedSharedServices &
    AddedSharedModelServices