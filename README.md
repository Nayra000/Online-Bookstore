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
- 🚀 **Caching Data**: Use Redis to store frequently accessed data for faster retrieval.
- ☁️ **Cloudinary Integration**: Upload and manage book images efficiently.
- 🔔 **Real-Time Notifications**: WebSockets notify admins when a new order is placed.
- 📩 **Email Notifications**: Send automated emails when users register, place an order, or when order status changes.
- 📜 **Application Logging**: Log system states and events using Winston & Morgan.
---

## 🛠️ Technologies Used

- **Backend**: Node.js, Express.js
- **Database**: MongoDB (Mongoose ODM)
- **Authentication**: JSON Web Token (JWT)
- **Package Manager**: npm
- **Development Tools**: Nodemon, ESLint
- **Caching**: Redis
- **Real-Time Communication**: WebSockets
- **payment Processing**: Stripe
- **Logging**: Winston & Morgan
- **Email Service**: Nodemailer
- **Cloud Storage**: Cloudinary

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

| Command              | Description                                               |
| -------------------- | --------------------------------------------------------- |
| `npm run start:dev`  | Runs in development mode 🔧 (auto-restarts with nodemon). |
| `npm run start:prod` | Runs in production mode 🚀 with `{HOSTNAME}`.             |
| `npm run lint`       | Checks for code quality issues.🛡️                         |
| `npm run fix`        | Fixes linting issues automatically.🔄                     |
| `npm run connect `   | to run the admin web socket as client                     |


## Deployment

🚀 The application is deployed at: [Online Bookstore](https://online-bookstore-ezp2.onrender.com)

## 📊 Entity Relationship Diagram (ERD)

![ERD](./Utils/ERD.png)
