# class-panic
A node JS website for interactive polling students

## Requirements:

git, nodeJS (up to date), npm, a mysql server.

## Installation

To install, you have several steps:

### clone the repository
```shell
git clone https://github.com/panglesd/class-panic.git
cd class-panic
```

### Install dependencies

```shell
npm install
```

### Set up the database
- Create a database
- Import classPanic.sql in your databse
- Create a user that has all access to this database
- Fill credentials.js so that the server can access the database:
```shell
cp credentials.js.example credentials.js
emacs credentials.js
```
### choose configuration
- Choose port, route and admin password in configuration.js
```shell
emacs configuration.js
```

## Start the server

```shell
npm start
```

## Test

Open your browser and got to ``localhost:port/path``
