/**
 * Local ESLint plugin for PreMiD activities.
 *
 * `require-support-check`: version-gated Presence/iFrame APIs (added in newer
 * extension versions) throw on older installs. Flag a call to one of them unless
 * the enclosing function also feature-detects it — via the bundled
 * `supports(obj, 'method')` helper, a `typeof obj.method === 'function'` check,
 * or an `if (obj.method)` truthiness check.
 *
 * A call is considered guarded when it sits inside the consequent of a support
 * check — `if (CHECK) { call }`, `CHECK && call`, or `CHECK ? call : ...` —
 * where CHECK is `supports(obj, 'method')`, `typeof obj.method === 'function'`,
 * or a plain `obj.method` truthiness test. This matches the documented pattern;
 * an early-return guard (`if (!supports(...)) return`) is not recognised, so
 * wrap the call or disable the line inline for that style. Matches by method
 * name + object source text.
 */

const GUARDED_METHODS = new Set(['execInPage', 'onRequest'])

function walk(node, cb) {
  if (!node || typeof node.type !== 'string')
    return
  cb(node)
  for (const key of Object.keys(node)) {
    if (key === 'parent')
      continue
    const value = node[key]
    if (Array.isArray(value)) {
      for (const child of value) {
        if (child && typeof child.type === 'string')
          walk(child, cb)
      }
    }
    else if (value && typeof value.type === 'string') {
      walk(value, cb)
    }
  }
}

const requireSupportCheck = {
  meta: {
    type: 'problem',
    fixable: 'code',
    docs: {
      description:
        'Require a support check before calling version-gated Presence/iFrame APIs (execInPage, onRequest)',
    },
    schema: [],
    messages: {
      unchecked:
        'Call to `{{method}}` is not guarded by a support check. Older PreMiD versions lack it and will throw. Wrap it in `if (supports({{obj}}, \'{{method}}\'))` (import { supports } from \'premid\').',
    },
  },
  create(context) {
    const sourceCode = context.sourceCode ?? context.getSourceCode()

    /** Does this test subtree reference a support check for obj.method? */
    function testReferencesSupport(testNode, objText, method) {
      let found = false
      walk(testNode, (n) => {
        if (found)
          return

        // supports(obj, 'method')
        if (
          n.type === 'CallExpression'
          && n.callee.type === 'Identifier'
          && n.callee.name === 'supports'
          && n.arguments.length >= 2
          && n.arguments[1].type === 'Literal'
          && n.arguments[1].value === method
          && sourceCode.getText(n.arguments[0]) === objText
        ) {
          found = true
          return
        }

        // obj.method outside a call position → typeof / truthiness check
        if (
          n.type === 'MemberExpression'
          && !n.computed
          && n.property.type === 'Identifier'
          && n.property.name === method
          && sourceCode.getText(n.object) === objText
        ) {
          const isCalleeOfCall
            = n.parent?.type === 'CallExpression' && n.parent.callee === n
          if (!isCalleeOfCall)
            found = true
        }
      })
      return found
    }

    function within(node, range) {
      return range && node.range[0] >= range[0] && node.range[1] <= range[1]
    }

    /**
     * Returns the enclosing `ExpressionStatement` if the call is its whole
     * expression (optionally wrapped in `await`/`void`) — i.e. a fire-and-forget
     * statement we can safely wrap. Returns null for value-capturing calls.
     */
    function fixableStatement(node, ancestors) {
      const statement = [...ancestors].reverse().find(a => a.type === 'ExpressionStatement')
      if (!statement)
        return null

      let expr = statement.expression
      while (expr && expr !== node) {
        if (expr.type === 'AwaitExpression' || (expr.type === 'UnaryExpression' && expr.operator === 'void'))
          expr = expr.argument
        else if (expr.type === 'ChainExpression')
          expr = expr.expression
        else
          break
      }
      return expr === node ? statement : null
    }

    /** Fix that ensures `supports` is imported from 'premid', or null if already. */
    function ensureSupportsImport(fixer) {
      const body = sourceCode.ast.body
      const premidImport = body.find(
        s => s.type === 'ImportDeclaration' && s.source.value === 'premid',
      )

      if (premidImport) {
        const named = premidImport.specifiers.filter(s => s.type === 'ImportSpecifier')
        if (named.some(s => s.imported.name === 'supports'))
          return null
        if (named.length)
          return fixer.insertTextAfter(named[named.length - 1], ', supports')
      }

      return fixer.insertTextBefore(body[0], 'import { supports } from \'premid\'\n')
    }

    return {
      CallExpression(node) {
        const { callee } = node
        if (callee.type !== 'MemberExpression' || callee.computed)
          return
        if (callee.property.type !== 'Identifier')
          return

        const method = callee.property.name
        if (!GUARDED_METHODS.has(method))
          return

        const objText = sourceCode.getText(callee.object)

        const ancestors = sourceCode.getAncestors(node)
        let guarded = false
        for (const ancestor of ancestors) {
          let test
          let guardedRange
          if (ancestor.type === 'IfStatement') {
            test = ancestor.test
            guardedRange = ancestor.consequent.range
          }
          else if (ancestor.type === 'ConditionalExpression') {
            test = ancestor.test
            guardedRange = ancestor.consequent.range
          }
          else if (ancestor.type === 'LogicalExpression' && ancestor.operator === '&&') {
            test = ancestor.left
            guardedRange = ancestor.right.range
          }
          else {
            continue
          }

          if (within(node, guardedRange) && testReferencesSupport(test, objText, method)) {
            guarded = true
            break
          }
        }

        if (guarded)
          return

        context.report({
          node,
          messageId: 'unchecked',
          data: { method, obj: objText },
          fix(fixer) {
            const statement = fixableStatement(node, ancestors)
            if (!statement)
              return null

            const line = sourceCode.lines[statement.loc.start.line - 1]
            const indent = line.slice(0, line.length - line.trimStart().length)
            const statementText = sourceCode.getText(statement)

            const fixes = []
            const importFix = ensureSupportsImport(fixer)
            if (importFix)
              fixes.push(importFix)

            fixes.push(fixer.replaceText(
              statement,
              `if (supports(${objText}, '${method}')) {\n${indent}  ${statementText}\n${indent}}`,
            ))

            return fixes
          },
        })
      },
    }
  },
}

export default {
  meta: { name: 'premid-local' },
  rules: {
    'require-support-check': requireSupportCheck,
  },
}
