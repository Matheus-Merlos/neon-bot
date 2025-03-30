<h1 align="center"> 🌌 N E O N   B O T 🌙 </h1>


<p align="center">
  <a href="https://forthebadge.com">
    <img src="https://forthebadge.com/images/badges/made-with-typescript.svg" alt="Badge 1" />
  </a>
  <a href="https://forthebadge.com">
    <img src="https://forthebadge.com/images/badges/built-with-love.svg" alt="Badge 2" />
  </a>
</p>

## ✨ Table of Contents

- Inviting to your server[WIP]
- [File organization](#file-organization)
- Deploy on your Own[WIP]
- [License](#️license)

## 📁 File Organization

This repository follows **GoF design patterns**, shaping its folder structure accordingly. The implemented patterns are **Decorator**, **Command**, **Strategy**, and **Singleton**. (Although there is a "factories" folder, it doesn’t strictly follow the Factory design pattern.)

A estrutura dos arquivos é a seguinte:

```YAML
src/              - Bot’s main source code
    commands/     - Commands, following the Command pattern
    db/           - Database connection object and Drizzle ORM schema
    decorators/   - Objects based on the Decorator pattern
    factories/    - Classes that manages database objects
    strategies/   - Strategy-based classes for sub-commands
    utils/        - General utilities used across the bot
docs/             - Documentation site (WIP)
```

## ⚖️ License

This project is licensed under the [MIT License](LICENSE).
You are free to use, modify, and distribute this software in accordance with the terms of the license.
For more details, see the `LICENSE` file included in this repository.