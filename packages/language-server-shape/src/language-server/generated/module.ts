/******************************************************************************
 * This file was generated by langium-cli 1.1.0.
 * DO NOT EDIT MANUALLY!
 ******************************************************************************/

import { LangiumGeneratedServices, LangiumGeneratedSharedServices, LangiumSharedServices, LangiumServices, LanguageMetaData, Module } from 'langium';
import { ShapeAstReflection } from './ast';
import { ShapeGrammar } from './grammar';

export const ShapeLanguageMetaData: LanguageMetaData = {
    languageId: 'shape',
    fileExtensions: ['.st', '.sd'],
    caseInsensitive: false
};

export const ShapeGeneratedSharedModule: Module<LangiumSharedServices, LangiumGeneratedSharedServices> = {
    AstReflection: () => new ShapeAstReflection()
};

export const ShapeGeneratedModule: Module<LangiumServices, LangiumGeneratedServices> = {
    Grammar: () => ShapeGrammar(),
    LanguageMetaData: () => ShapeLanguageMetaData,
    parser: {}
};
