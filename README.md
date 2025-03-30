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
- [Issues & Contributions](#issues--contributions-️)
- [File organization](#file-organization-)
- [Deploy on Your Own](#deploying-on-your-own-️)
- [License](#license-️)

## Issues & Contributions 🛠️

We welcome contributions and bug reports!

- **Found a bug or an issue?**

If you encounter a bug or have a suggestion for improvement, feel free to open an [**Issue**](https://github.com/Matheus-Merlos/neon-bot/issues). Please provide as much detail as possible, including steps to reproduce the issue. You can also mention me, and I'll take a look as soon as possible.

- **Want to contribute?**

If you'd like to contribute, feel free to open a [**Pull Request**](https://github.com/Matheus-Merlos/neon-bot/pulls). Make sure to follow the existing code style and include a clear description of your changes. Contributions are always appreciated!

## File Organization 📁

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

## Deploying on Your Own 🖥️

Deploying the application on your own is very simple. You will need the following:

- A **PostgreSQL database**
- An **S3 bucket** (to store images):
    - The bucket must have the public-read ACL and BucketOwnerPreferred as the Bucket Ownership Control.
- An **IAM user** with an access key to access the S3 bucket. The user must have the following permissions:
```JSON
"s3:PutObject"
"s3:GetObject"
"s3:PutObjectAcl"
"s3:DeleteObject"
```
- A **machine** to run the bot client on

After configuring all these resources:
1. Clone this repository.
2. Run `npm ci` to install all dependencies.
3. Compile the source code with `npx tsc`.
4. Copy `package.json` and `package-lock.json` to the `dist/` folder.
5. In the `dist/` folder, `npm ci --omit=dev`, to install only the required dependencies (excluding devDependencies).
6. Create a .env file inside the `dist/` folder, and populate it with the variables found in `.env.example`
7. Run `npm run prod:database:push` to create and apply the database migrations.
8. Start the application by running `node main.js`
9. You're all set! 🎉

## License ⚖️

This project is licensed under the [MIT License](LICENSE).
You are free to use, modify, and distribute this software in accordance with the terms of the license.
For more details, see the `LICENSE` file included in this repository.