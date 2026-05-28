import { before, describe, test } from 'node:test'

import * as assert from 'assert'
import * as path from 'path'

import { clearWorkspaceCache, resolveCatalogVersion, resolveWorkspaceVersion } from '../workspace'

const testdataDir = path.resolve('./src/test-node/testdata')
const catalogWorkspaceDir = path.resolve('./src/test-node/testdata/catalog-workspace')

describe('workspace', () => {
  before(() => {
    clearWorkspaceCache()
  })

  test('should return undefined for non-workspace versions', () => {
    const result = resolveWorkspaceVersion(
      '^1.2.3',
      'some-pkg',
      path.join(testdataDir, 'dummy.json'),
    )
    assert.strictEqual(result, undefined)
  })

  test('should resolve workspace:* to the local package version', () => {
    const result = resolveWorkspaceVersion(
      'workspace:*',
      'pkg-a',
      path.join(testdataDir, 'packages', 'consumer', 'package.json'),
    )
    assert.deepStrictEqual(result, { version: '1.0.0', isWorkspace: true })
  })

  test('should resolve workspace:^ to the local package version', () => {
    const result = resolveWorkspaceVersion(
      'workspace:^',
      'pkg-b',
      path.join(testdataDir, 'packages', 'consumer', 'package.json'),
    )
    assert.deepStrictEqual(result, { version: '2.5.0', isWorkspace: true })
  })

  test('should resolve workspace:~ to the local package version', () => {
    const result = resolveWorkspaceVersion(
      'workspace:~',
      'app',
      path.join(testdataDir, 'packages', 'consumer', 'package.json'),
    )
    assert.deepStrictEqual(result, { version: '0.1.0', isWorkspace: true })
  })

  test('should resolve workspace:1.2.3 to the explicit version', () => {
    const result = resolveWorkspaceVersion(
      'workspace:1.2.3',
      'pkg-a',
      path.join(testdataDir, 'packages', 'consumer', 'package.json'),
    )
    assert.deepStrictEqual(result, { version: '1.2.3', isWorkspace: true })
  })

  test('should resolve workspace:^1.2.3 to the explicit version', () => {
    const result = resolveWorkspaceVersion(
      'workspace:^1.2.3',
      'pkg-a',
      path.join(testdataDir, 'packages', 'consumer', 'package.json'),
    )
    assert.deepStrictEqual(result, { version: '^1.2.3', isWorkspace: true })
  })

  test('should resolve deep workspace packages with ** glob', () => {
    const result = resolveWorkspaceVersion(
      'workspace:*',
      'button',
      path.join(testdataDir, 'packages', 'consumer', 'package.json'),
    )
    assert.deepStrictEqual(result, { version: '3.0.0-beta.1', isWorkspace: true })
  })

  test('should return undefined when workspace package is not found', () => {
    const result = resolveWorkspaceVersion(
      'workspace:*',
      'non-existent-pkg',
      path.join(testdataDir, 'packages', 'consumer', 'package.json'),
    )
    assert.strictEqual(result, undefined)
  })

  test('should return undefined when no pnpm-workspace.yaml exists', () => {
    const result = resolveWorkspaceVersion(
      'workspace:*',
      'pkg-a',
      path.join('/tmp', 'no-workspace', 'package.json'),
    )
    assert.strictEqual(result, undefined)
  })

  test('should handle yaml with comments and mixed quotes', () => {
    const result = resolveWorkspaceVersion(
      'workspace:*',
      'pkg-b',
      path.join(testdataDir, 'ws-comments', 'packages', 'consumer', 'package.json'),
    )
    assert.deepStrictEqual(result, { version: '2.5.0', isWorkspace: true })
  })

  test('should handle empty packages array', () => {
    const result = resolveWorkspaceVersion(
      'workspace:*',
      'pkg-a',
      path.join(testdataDir, 'ws-empty', 'packages', 'consumer', 'package.json'),
    )
    assert.strictEqual(result, undefined)
  })

  test('should use cache on repeated lookups', () => {
    clearWorkspaceCache()

    const first = resolveWorkspaceVersion(
      'workspace:*',
      'pkg-a',
      path.join(testdataDir, 'packages', 'consumer', 'package.json'),
    )
    assert.deepStrictEqual(first, { version: '1.0.0', isWorkspace: true })

    const second = resolveWorkspaceVersion(
      'workspace:*',
      'pkg-b',
      path.join(testdataDir, 'packages', 'consumer', 'package.json'),
    )
    assert.deepStrictEqual(second, { version: '2.5.0', isWorkspace: true })
  })

  test('should resolve catalog: to default catalog entry', () => {
    const result = resolveCatalogVersion(
      'catalog:',
      'react',
      path.join(catalogWorkspaceDir, 'packages', 'consumer', 'package.json'),
    )
    assert.deepStrictEqual(result, { version: '^19.2.5', isCatalog: true })
  })

  test('should resolve catalog:default to default catalog entry', () => {
    const result = resolveCatalogVersion(
      'catalog:default',
      'lodash',
      path.join(catalogWorkspaceDir, 'packages', 'consumer', 'package.json'),
    )
    assert.deepStrictEqual(result, { version: '4.17.21', isCatalog: true })
  })

  test('should resolve catalog:legacy to named catalog entry', () => {
    const result = resolveCatalogVersion(
      'catalog:legacy',
      'react',
      path.join(catalogWorkspaceDir, 'packages', 'consumer', 'package.json'),
    )
    assert.deepStrictEqual(result, { version: '^17.0.2', isCatalog: true })
  })

  test('should resolve catalog:legacy for scoped package', () => {
    const result = resolveCatalogVersion(
      'catalog:legacy',
      'react-dom',
      path.join(catalogWorkspaceDir, 'packages', 'consumer', 'package.json'),
    )
    assert.deepStrictEqual(result, { version: '^17.0.2', isCatalog: true })
  })

  test('should return undefined for missing catalog entry', () => {
    const result = resolveCatalogVersion(
      'catalog:',
      'non-existent-pkg',
      path.join(testdataDir, 'packages', 'consumer', 'package.json'),
    )
    assert.strictEqual(result, undefined)
  })

  test('should return undefined for missing named catalog', () => {
    const result = resolveCatalogVersion(
      'catalog:missing',
      'react',
      path.join(testdataDir, 'packages', 'consumer', 'package.json'),
    )
    assert.strictEqual(result, undefined)
  })

  test('should return undefined when no pnpm-workspace.yaml exists', () => {
    const result = resolveCatalogVersion(
      'catalog:',
      'react',
      path.join('/tmp', 'no-workspace', 'package.json'),
    )
    assert.strictEqual(result, undefined)
  })

  test('should return undefined for non-catalog versions', () => {
    const result = resolveCatalogVersion('^1.2.3', 'react', path.join(testdataDir, 'dummy.json'))
    assert.strictEqual(result, undefined)
  })

  test('should support pnpm-workspace.yml extension', () => {
    // ws-yml only contains a pnpm-workspace.yml (no .yaml) so this exercises the .yml fallback
    const result = resolveWorkspaceVersion(
      'workspace:*',
      'app',
      path.join(testdataDir, 'ws-yml', 'packages', 'consumer', 'package.json'),
    )
    assert.deepStrictEqual(result, { version: '0.1.0', isWorkspace: true })
  })

  test('should gracefully handle invalid yaml', () => {
    const result = resolveWorkspaceVersion(
      'workspace:*',
      'pkg-a',
      path.join(testdataDir, 'ws-invalid', 'packages', 'consumer', 'package.json'),
    )
    assert.strictEqual(result, undefined)

    const catalogResult = resolveCatalogVersion(
      'catalog:',
      'react',
      path.join(testdataDir, 'ws-invalid', 'packages', 'consumer', 'package.json'),
    )
    assert.strictEqual(catalogResult, undefined)
  })
})
