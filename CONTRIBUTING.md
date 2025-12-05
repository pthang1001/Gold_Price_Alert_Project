# Contributing Guidelines

## Code of Conduct

Be respectful, inclusive, and professional in all interactions.

## Getting Started

1. Fork the repository
2. Clone your fork
3. Create a feature branch
4. Make changes
5. Test thoroughly
6. Submit a pull request

## Development Setup

```bash
# Install dependencies
cd backend/services/[service-name]
npm install

# Start development server
npm run dev

# Run tests
npm test

# Check linting
npm run lint

# Format code
npm run format
```

## Commit Guidelines

- Use descriptive commit messages
- Reference issues: `Fixes #123`
- Use present tense: "Add feature" not "Added feature"
- Format: `[service] action: description`

Examples:
```
[auth] fix: correct JWT token validation
[user] feat: add user profile update endpoint
[price] perf: optimize price fetching query
[api-gateway] chore: update dependencies
```

## Pull Request Process

1. Update README.md if adding new features
2. Add/update tests for new code
3. Ensure all tests pass: `npm test`
4. Ensure code is formatted: `npm run format`
5. Ensure no lint errors: `npm run lint`
6. Request review from maintainers

## Code Style

### JavaScript/Node.js
- Use ES6+ features
- 2-space indentation
- Single quotes for strings
- Semicolons required
- No `var` - use `const` or `let`

```javascript
// Good
const userService = require('../services/user');
const { getUser } = userService;

// Bad
var userService = require("../services/user");
```

### Naming Conventions
- **Files**: `kebab-case` (user-service.js)
- **Variables**: `camelCase` (userName)
- **Constants**: `UPPER_SNAKE_CASE` (MAX_RETRIES)
- **Classes**: `PascalCase` (UserService)

### Error Handling
```javascript
// Always include error handling
try {
  const user = await User.findById(id);
  if (!user) {
    throw new Error('User not found');
  }
  return user;
} catch (error) {
  logger.error('Error fetching user:', error);
  throw error;
}
```

### Logging
```javascript
// Use Winston logger for all logging
logger.info('User created', { userId: user.id });
logger.warn('Retry attempt', { attempt: 2, maxRetries: 3 });
logger.error('Database error', error);
```

## Testing

- Write tests for new features
- Aim for 80%+ code coverage
- Use Jest for unit tests
- Follow AAA pattern (Arrange, Act, Assert)

```javascript
describe('User Service', () => {
  it('should create a new user', async () => {
    // Arrange
    const userData = { email: 'test@example.com', name: 'Test' };

    // Act
    const user = await userService.create(userData);

    // Assert
    expect(user.id).toBeDefined();
    expect(user.email).toBe('test@example.com');
  });
});
```

## Documentation

- Update README.md for significant changes
- Add JSDoc comments for functions
- Include examples for API changes

```javascript
/**
 * Get user by ID
 * @param {string} userId - The user ID
 * @returns {Promise<Object>} User object
 * @throws {Error} If user not found
 *
 * @example
 * const user = await getUserById('123');
 */
async function getUserById(userId) {
  return User.findById(userId);
}
```

## Performance Considerations

- Use indexes for database queries
- Cache frequently accessed data in Redis
- Batch process large datasets
- Use pagination for list endpoints
- Monitor query performance

## Security Considerations

- Validate all user inputs
- Use parameterized queries
- Hash passwords securely (bcrypt)
- Implement rate limiting
- Use HTTPS in production
- Never commit secrets (.env files)

## Database Changes

- Use migrations for schema changes
- Always have a rollback plan
- Test migrations thoroughly
- Document breaking changes

## API Changes

- Maintain backward compatibility when possible
- Use semantic versioning
- Document API changes in CHANGELOG
- Add deprecation warnings before removing endpoints

## Reporting Issues

Include:
- Description of the issue
- Steps to reproduce
- Expected behavior
- Actual behavior
- Environment (Node version, OS, etc.)
- Error messages and logs

## Feature Requests

Include:
- Clear description of the feature
- Use case and benefits
- Proposed implementation (if applicable)
- Example usage

## Review Process

- Maintainers will review within 48 hours
- Address feedback and re-request review
- Once approved, merge to main branch
- Delete feature branch after merge

## Release Process

1. Update version in package.json
2. Update CHANGELOG.md
3. Create git tag: `git tag v1.0.0`
4. Push tag: `git push origin v1.0.0`
5. Create GitHub release with notes

## Questions?

- Open an issue for discussions
- Check existing issues and PRs first
- Ask for help in issues or discussions section

---

Thank you for contributing! 🎉
