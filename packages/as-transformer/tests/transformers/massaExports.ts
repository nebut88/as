import { MassaExport } from '../../src/transformers/massaExport';
import { MassaFunctionNode } from '../../src/helpers/node';

let massaExportTransformer = new MassaExport();

describe('generateWrapper', () => {
  it('should generate a void wrapper function', () => {
    const node = new MassaFunctionNode('SayHello', '', []);

    let wrapper = `export function ${node.name}(_args: StaticArray<u8>): void {\n  _ms_${node.name}_();\n`;
    wrapper += `}`;

    massaExportTransformer['_setFunctionSignatureData'](node);
    const actualWrapper = massaExportTransformer['_generateWrapper']();

    expect(actualWrapper).toStrictEqual(wrapper);
  });

  it('should generate a non-void wrapper function with args', () => {
    const node = new MassaFunctionNode('SayHello', 'string', [
      { name: 'language', type: 'string' },
      { name: 'name', type: 'string' },
    ]);

    let wrapper = `export function ${node.name}(_args: StaticArray<u8>): StaticArray<u8> {\n`;
    wrapper += `  const args = decode${node.name}Helper(Uint8Array.wrap(changetype<ArrayBuffer>(_args)));\n`;
    wrapper += `  const response = encode${node.name}RHelper`;
    wrapper += `(new ${node.name}RHelper(_ms_${node.name}_(args.language, args.name)));\n\n`;

    wrapper += `  return changetype<StaticArray<u8>>(response.buffer);\n`;
    wrapper += '}';

    massaExportTransformer['_setFunctionSignatureData'](node);
    const actualWrapper = massaExportTransformer['_generateWrapper']();

    expect(actualWrapper).toStrictEqual(wrapper);
  });

  it('should generate a non-void wrapper function without args', () => {
    const node = new MassaFunctionNode('SayHello', 'string', []);

    let wrapper = `export function ${node.name}(_args: StaticArray<u8>): StaticArray<u8> {\n`;
    wrapper += `  const response = encode${node.name}RHelper(new ${node.name}RHelper(_ms_${node.name}_()));\n\n`;

    wrapper += `  return changetype<StaticArray<u8>>(response.buffer);\n`;
    wrapper += '}';

    massaExportTransformer['_setFunctionSignatureData'](node);
    const actualWrapper = massaExportTransformer['_generateWrapper']();

    expect(actualWrapper).toStrictEqual(wrapper);
  });
});

describe('generateImports', () => {
  it('should return an empty array when args and returnedType are empty', () => {
    const node = new MassaFunctionNode('SayHello', '', []);

    const expectedImports: string[] = [];
    massaExportTransformer['_setFunctionSignatureData'](node);

    const actualImports = massaExportTransformer['_generateImports']();

    expect(actualImports).toStrictEqual(expectedImports);
  });

  it('should return only deserializing helper when args is not an empty and returnedType is', () => {
    const node = new MassaFunctionNode('SayHello', '', [
      { name: 'language', type: 'string' },
      { name: 'name', type: 'string' },
    ]);

    const expectedImports = [
      `import { decode${node.name}Helper } from "./${node.name}Helper";`,
    ];
    massaExportTransformer['_setFunctionSignatureData'](node);
    const actualImports = massaExportTransformer['_generateImports']();

    expect(actualImports).toStrictEqual(expectedImports);
  });

  it('should return (de)serializing helpers and generatedEvent when args is empty and returnedType is not', () => {
    const node = new MassaFunctionNode('SayHello', 'string', []);

    const expectedImports = [
      `import { ${node.name}RHelper, encode${node.name}RHelper } from "./${node.name}RHelper";`,
    ];
    massaExportTransformer['_setFunctionSignatureData'](node);
    const actualImports = massaExportTransformer['_generateImports']();

    expect(actualImports).toStrictEqual(expectedImports);
  });

  it('should return everything when args and returnedType are not empty', () => {
    const node = new MassaFunctionNode('SayHello', 'string', [
      { name: 'language', type: 'string' },
      { name: 'name', type: 'string' },
    ]);

    const expectedImports = [
      `import { decode${node.name}Helper } from "./${node.name}Helper";`,
      `import { ${node.name}RHelper, encode${node.name}RHelper } from "./${node.name}RHelper";`,
    ];
    massaExportTransformer['_setFunctionSignatureData'](node);
    const actualImports = massaExportTransformer['_generateImports']();

    expect(actualImports).toStrictEqual(expectedImports);
  });
});
