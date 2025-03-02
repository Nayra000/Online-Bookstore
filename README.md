# 📚 Online-Bookstore

## 📖 Project Overview

The **Online Bookstore** is a web-based e-commerce platform where users can browse books, add them to a cart, and place orders. The project covers fundamental backend development concepts and introduces advanced features for independent research.

## 🚀 Features

- 🔐 **User Authentication**: Register, login, and logout securely.
- 📚 **Book Browsing**: Search books by category, author, or title.
- 📝 **Detailed Book Descriptions**: View book details before purchasing.
- 🛒 **Shopping Cart**: Add, update, or remove books.
- 📦 **Order Placement**: Place orders and track purchase history.
- 💳 **Payment Gateway Integration** _(optional)_.
- 🛠️ **Admin Panel**: Manage books, orders, and users.

---

## 🛠️ Technologies Used

- **Backend**: Node.js, Express.js
- **Database**: MongoDB (Mongoose ODM)
- **Authentication**: JSON Web Token (JWT)
- **Package Manager**: npm
- **Development Tools**: Nodemon, ESLint

---

## 📂 Clone the Repository

To get a local copy up and running, use:

```sh
git clone https://github.com/sallmayasser/online-bookstore.git
```

## ⚙️ Installation

```sh
npm install
```

## 📜 Scripts

| Command               | Description |
|-----------------------|-------------|
| `npm run start:dev`   | Runs in development mode  🔧 (auto-restarts with nodemon). |
| `npm run start:prod`  | Runs in production mode 🚀 with `{HOSTNAME}`. |
| `npm run lint`        | Checks for code quality issues.🛡️ |
| `npm run fix`         | Fixes linting issues automatically.🔄 

### 📊 Entity Relationship Diagram (ERD)

![ERD](./Utils/ERD.png)
