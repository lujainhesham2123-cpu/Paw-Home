# PawHome

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

PawHome is a pet adoption website that connects people who need to rehome a cat, dog or other pet with people who want to adopt one. In Egypt, many pets are rehomed through scattered social media posts, where details get lost, several people ask about the same pet and owners cannot keep track of who is interested. PawHome gives each pet a clear post with its details, lets adopters send an adoption request in one click, and lets the owner accept the right adopter, so pets find a home faster and fewer end up abandoned on the street.

## 3. Features

### 3.1 The full product

- Register and log in
- Post a pet for adoption with its name, type, breed, age, gender, description and photo
- Edit or delete your own pet posts
- Browse all pets that are available for adoption
- Search pets by name and filter by type, age, gender and city
- Upload several photos of a pet
- Send an adoption request with a message, and cancel it
- Accept or reject adoption requests; an adopted pet is marked as adopted
- Chat between the owner and the adopter
- Save pets to a favourites list
- Shelter accounts that manage many pets at once
- Vaccination and medical records for each pet
- Email notifications when a request is received or answered
- Donations to shelters
- Admin panel to remove fake posts and block users

### 3.2 The use cases we will build

| # | Use case | What the user does | What they see | What is stored |
|---|---|---|---|---|
| 1 | Registration and login | Registers with name, email and password; logs in with email and password | Their home page, with their name in the header | A User, with the password hashed |
| 2 | Post a pet for adoption | Fills in a form with the pet's name, type, breed, age, gender, city, description and a photo link, and submits it | The new pet on the browse page and on their "My pets" page | A Pet, linked to its owner, with status "available" |
| 3 | Edit or delete a pet post | On "My pets", opens one of their own pets and changes its details, or deletes the post | The updated pet, or the list without the deleted pet | The Pet is updated, or removed from the database |
| 4 | Send or cancel an adoption request | Opens another user's available pet, writes a short message about their home and clicks "Request to adopt"; can cancel a request that is still pending | The request on their "My requests" page with status "pending", or removed after cancelling | An AdoptionRequest, linked to the pet, the adopter and the owner, with status "pending"; removed when cancelled |
| 5 | Accept or reject an adoption request | On "Incoming requests", the owner accepts or rejects an adopter's request | The request's new status; an accepted pet shows as "adopted" | The AdoptionRequest's status becomes "accepted" or "rejected"; on accept, the Pet's status becomes "adopted" and its other pending requests become "rejected" |

## 4. Who owns what

| Member | Use case |
|---|---|
| Zeiad Abdulrahim | 1. Registration and login |
| Lujain Hesham | 2. Post a pet for adoption |
| Zeina Walid | 3. Edit or delete a pet post |
| Haidy Rashed | 4. Send or cancel an adoption request |
| Laila Mohamed | 5. Accept or reject an adoption request |

## 5. Data model

### User

```js
const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true }, // stored hashed, never as plain text
}, { timestamps: true });
```

### Pet

```js
const petSchema = new mongoose.Schema({
  name: { type: String, required: true },
  type: { type: String, enum: ['cat', 'dog', 'bird', 'rabbit', 'other'], required: true },
  breed: { type: String },
  age: { type: Number, required: true, min: 0 }, // in months
  gender: { type: String, enum: ['male', 'female'], required: true },
  city: { type: String, required: true },
  description: { type: String, required: true },
  photoUrl: { type: String },
  status: { type: String, enum: ['available', 'adopted'], default: 'available' },
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
}, { timestamps: true });
```

### AdoptionRequest

```js
const adoptionRequestSchema = new mongoose.Schema({
  pet: { type: mongoose.Schema.Types.ObjectId, ref: 'Pet', required: true },
  adopter: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  message: { type: String },
  status: { type: String, enum: ['pending', 'accepted', 'rejected'], default: 'pending' },
}, { timestamps: true });
```

## 6. Run it locally

> Leave this section as it is until Submission 2 (Thursday 10 December 2026,
> 23:59). Then fill it in: we follow these steps to run your project.

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
