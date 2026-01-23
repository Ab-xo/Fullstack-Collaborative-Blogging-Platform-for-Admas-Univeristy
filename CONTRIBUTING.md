# Contributing to Admas University Blog Platform

First off, thank you for considering contributing to the Admas University Blog Platform! It's people like you that make this platform a great tool for the academic community.

## 🌟 How Can I Contribute?

### Reporting Bugs

Before creating bug reports, please check the existing issues to avoid duplicates. When you create a bug report, include as many details as possible:

- **Use a clear and descriptive title**
- **Describe the exact steps to reproduce the problem**
- **Provide specific examples** (screenshots, code snippets)
- **Describe the behavior you observed and what you expected**
- **Include your environment details** (OS, browser, Node version)

### Suggesting Enhancements

Enhancement suggestions are tracked as GitHub issues. When creating an enhancement suggestion:

- **Use a clear and descriptive title**
- **Provide a detailed description of the suggested enhancement**
- **Explain why this enhancement would be useful**
- **List any similar features in other applications** (if applicable)

### Pull Requests

1. **Fork the repository** and create your branch from `main`
2. **Follow the coding style** of the project
3. **Write clear commit messages** following conventional commits
4. **Test your changes** thoroughly
5. **Update documentation** if needed
6. **Submit a pull request** with a clear description

## 🚀 Development Setup

### Prerequisites

- Node.js (v20.x or higher)
- npm or yarn
- MongoDB (local or Atlas)
- Git

### Installation

```bash
# Clone your fork
git clone https://github.com/YOUR_USERNAME/Fullstack-Collaborative-Blogging-Platform-for-Admas-Univeristy.git
cd Fullstack-Collaborative-Blogging-Platform-for-Admas-Univeristy

# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

### Running Locally

```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend
cd frontend
npm run dev
```

## 📝 Coding Standards

### JavaScript/React

- Use **ES6+ syntax**
- Follow **React best practices** and hooks patterns
- Use **functional components** over class components
- Keep components **small and focused**
- Use **meaningful variable and function names**

### CSS/Tailwind

- Use **Tailwind utility classes** first
- Create custom CSS only when necessary
- Follow **mobile-first** responsive design
- Use **dark mode** compatible colors

### Git Commit Messages

Follow the [Conventional Commits](https://www.conventionalcommits.org/) specification:

```
feat: add user profile page
fix: resolve login authentication issue
docs: update API documentation
style: format code with prettier
refactor: simplify post creation logic
test: add unit tests for auth service
chore: update dependencies
```

## 🧪 Testing

- Write tests for new features
- Ensure all tests pass before submitting PR
- Aim for good test coverage

```bash
# Run backend tests
cd backend
npm test

# Run frontend tests
cd frontend
npm test
```

## 📚 Documentation

- Update README.md if you change functionality
- Add JSDoc comments for complex functions
- Update API documentation for backend changes
- Include inline comments for complex logic

## 🔍 Code Review Process

1. Maintainers will review your PR
2. Address any requested changes
3. Once approved, your PR will be merged
4. Your contribution will be credited in the release notes

## 🎯 Project Structure

```
admas-blog/
├── backend/          # Node.js/Express backend
│   ├── src/
│   │   ├── controllers/
│   │   ├── models/
│   │   ├── routes/
│   │   ├── middleware/
│   │   └── services/
│   └── package.json
├── frontend/         # React/Vite frontend
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── hooks/
│   │   ├── api/
│   │   └── styles/
│   └── package.json
└── README.md
```

## 🤝 Community

- Be respectful and inclusive
- Help others learn and grow
- Give constructive feedback
- Celebrate contributions

## 📧 Contact

If you have questions, feel free to:

- Open an issue
- Start a discussion
- Contact the maintainers

## 📄 License

By contributing, you agree that your contributions will be licensed under the same license as the project.

---

Thank you for contributing to Admas University Blog Platform! 🎓✨
