import * as fs from 'fs';
import * as path from 'path';

describe('EclipseID Smart Contract', () => {
  it('should compile successfully and generate a valid Contract artifact', () => {
    // Verify the compiled contract class exists in the managed directory
    const contractPath = path.resolve(__dirname, '../managed/contract/index.js');
    expect(fs.existsSync(contractPath)).toBe(true);
  });

  it('should generate the ZK IR (Zero-Knowledge Intermediate Representation)', () => {
    // Verify the compiler generated the ZK circuits
    const zkirPath1 = path.resolve(__dirname, '../managed/zkir/add_issuer.zkir');
    const zkirPath2 = path.resolve(__dirname, '../managed/zkir/verify_and_claim.zkir');
    expect(fs.existsSync(zkirPath1)).toBe(true);
    expect(fs.existsSync(zkirPath2)).toBe(true);
  });
});

