# CampusSwap

**Course:** Electronic Business Development (BINF 503) · Winter 2026  
**Instructor:** Dr. Nourhan Hamdi  
**Teaching Assistants:** Mr. Nour Gaser, Mr. Omar Alaa, Ms. Mariam Khalid, Mr. Younes Zied, Mr. Mahmoud Hani

## 1. Team

| Name | Student ID | Tutorial group | GitHub username |
|---|---|---|---|
| Zeiad Abdulrahim | 14001970 | T8 | azeiad894-arch |
| Lujain Hesham | 16006022 | T9 | lujainhesham2123-cpu |
| Zeina Walid | 16005981 | T9 | zeinawalid481 |
| Haidy Rashed | 16002509 | T9 | haidyrashed1 |
| Laila Mohamed | 16003552 | T9 | llllailamandour-ai |

## 2. The idea

CampusSwap is a marketplace where university students buy and sell used textbooks, notes, lab equipment and other study supplies with each other. Students often pay full price for books they need for one semester, while others have the same books sitting unused. CampusSwap lets a student list an item in a minute, lets other students find it and send a request to buy it, and lets the seller accept or reject requests, so used supplies are passed on cheaply inside the campus instead of being thrown away.

## 3. Features

### 3.1 The full product

- Register and log in with a university email
- Create, edit and delete listings with title, description, price, condition and category
- Browse all available listings
- Search listings by keyword and filter by category, price and condition
- Upload photos of an item
- Send a request to buy an item, and cancel it
- Accept or reject requests; an accepted item is marked as sold
- Chat between buyer and seller
- Choose a meeting point on campus for the hand-over
- Rate and review the other student after a sale
- Save listings to a wishlist
- Notifications by email when a request is received or answered
- Online payment inside the app
- Admin panel to remove inappropriate listings and block users

### 3.2 The use cases we will build

| # | Use case | What the user does | What they see | What is stored |
|---|---|---|---|---|
| 1 | Registration and login | Registers with name, email and password; logs in with email and password | Their home page, with their name in the header | A User, with the password hashed |
| 2 | Create a listing | Fills in a form with the item's title, description, price, condition and category, and submits it | The new listing on the browse page and on their "My listings" page | A Listing, linked to the seller, with status "available" |
| 3 | Edit or delete a listing | On "My listings", opens one of their own listings and changes its details, or deletes it | The updated listing, or the list without the deleted one | The Listing is updated, or removed from the database |
| 4 | Send or cancel a purchase request | Opens another student's available listing, writes an optional message and clicks "Request to buy"; can cancel a request that is still pending | The request on their "My requests" page with status "pending", or removed after cancelling | A Request, linked to the listing, the buyer and the seller, with status "pending"; removed when cancelled |
| 5 | Accept or reject a request | On "Incoming requests", the seller accepts or rejects a buyer's request | The request's new status; an accepted listing shows as "sold" | The Request's status becomes "accepted" or "rejected"; on accept, the Listing's status becomes "sold" and its other pending requests become "rejected" |

## 4. Who owns what

| Member | Use case |
|---|---|
| Zeiad Abdulrahim | 1. Registration and login |
| Lujain Hesham | 2. Create a listing |
| Zeina Walid | 3. Edit or delete a listing |
| Haidy Rashed | 4. Send or cancel a purchase request |
| Laila Mohamed | 5. Accept or reject a request |

## 5. Data model

### User

```js
const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true }, // stored hashed, never as plain text
}, { timestamps: true });
```

### Listing

```js
const listingSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  price: { type: Number, required: true, min: 0 }, // in EGP
  condition: { type: String, enum: ['new', 'like new', 'good', 'fair'], required: true },
  category: { type: String, enum: ['books', 'notes', 'lab equipment', 'electronics', 'other'], required: true },
  status: { type: String, enum: ['available', 'sold'], default: 'available' },
  seller: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
}, { timestamps: true });
```

### Request

```js
const requestSchema = new mongoose.Schema({
  listing: { type: mongoose.Schema.Types.ObjectId, ref: 'Listing', required: true },
  buyer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  seller: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  message: { type: String },
  status: { type: String, enum: ['pending', 'accepted', 'rejected'], default: 'pending' },
}, { timestamps: true });
```

## 6. Run it locally

> Leave this section as it is until Submission 2 (Thursday 10 December 2026, 23:59). Then fill it in: we follow these steps to run your project.

### Back end

```bash
cd backend
npm install
# create backend/.env from backend/.env.example (see the table below)
npm start
```

The API runs on http://localhost:3000.

| Variable in `.env` | What it is |
|---|---|
| `MONGODB_URI` | The connection string of your MongoDB Atlas database |
| `JWT_SECRET` | Any long random text, used to sign login tokens |
| [Any other variable] | [What it is] |

### Front end

```bash
cd frontend
npm install
npm run dev
```

The app runs on [the address `npm run dev` prints, e.g. http://localhost:5173].