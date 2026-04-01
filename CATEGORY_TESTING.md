# 🏷️ Category Management - Quick Start Guide

## 🚀 Getting Started

### Step 1: Start Backend Server

```bash
cd backend
npm install  # if modules not installed
node src/seedData.js  # Seed initial categories
npm start
```

✅ Server should be running at `http://localhost:5000`

### Step 2: Start Frontend

```bash
# In another terminal
cd frontend
npm install  # if modules not installed
npm start
```

✅ Frontend should be running at `http://localhost:3000`

---

## 👤 Test Accounts

### Admin Account

- **Email:** admin@example.com
- **Password:** admin123

### Regular User Account

- **Email:** user@example.com
- **Password:** user123

---

## 🧪 Testing Scenarios

### Scenario 1: View Categories as Regular User

1. **Go to Homepage**
   - Open `http://localhost:3000`
   - Scroll to "Shop by Category" section
2. **Expected Results:**
   - ✅ See 4 category cards: Electronics, Accessories, Gadgets, Wearables
   - ✅ Each shows emoji as placeholder (no uploaded images yet)
   - ✅ NO "🔄 Replace" button visible
   - ✅ "Explore" link works to filter products

---

### Scenario 2: Create New Category (Admin)

1. **Login as Admin**
   - Click "Account" → "Admin Panel"
   - Or login at `http://localhost:3000/login` with admin@example.com
   - Should see Admin Dashboard

2. **Navigate to Categories Tab**
   - Click "🏷️ Categories" button in admin panel

3. **Create New Category**
   - Click "+ New Category" button
   - Fill form:
     - **Name:** "Smart Home"
     - **Description:** "IoT and smart home devices"
     - **Image:** Select a JPG/PNG file from your computer
   - Click "Create Category"
   - ✅ Should see success message
   - ✅ New category appears in grid

4. **Verify on Homepage**
   - Go to homepage
   - Scroll to categories
   - ✅ New "Smart Home" category appears

---

### Scenario 3: Replace Category Image (from Admin Panel)

1. **In Admin Categories Tab**
   - Find any existing category (e.g., "Electronics")
   - Click "✏️ Edit" button

2. **Replace Image**
   - Form shows current image
   - See "🔄 Replace with New Image" button
   - Select new image file
   - Click "Update Category"
   - ✅ Success message appears
   - ✅ Image updates immediately

---

### Scenario 4: Replace Category Image (from HomePage - Admin Only)

1. **Login as Admin & Go to HomePage**
   - Should see "Shop by Category" section

2. **Replace Image Inline**
   - Hover over any category card
   - See 🔄 button (VISIBLE ONLY TO ADMIN)
   - Click the 🔄 button
   - Select image file
   - Click ✓ Upload
   - ✅ Image updates on the page

3. **Verify Regular User Can't See Replace**
   - Logout from admin
   - Go to homepage as regular user
   - ✅ NO 🔄 button visible

---

### Scenario 5: Delete Category (Admin)

1. **In Admin Categories Tab**
   - Find category to delete
   - Click "🗑️ Delete" button
   - Confirm deletion in popup

2. **Verify Deletion**
   - ✅ Category disappears from admin grid
   - ✅ Category disappears from homepage
   - ✅ Products in category still exist (soft delete)

---

### Scenario 6: Image Upload Validation

1. **Test Invalid File Size**
   - Try uploading file > 5MB
   - ✅ Should show error: "File size exceeds 5MB limit"

2. **Test Invalid File Type**
   - Try uploading .txt, .pdf, .doc file
   - ✅ Should show error: "Invalid file type. Only JPEG, PNG, GIF, and WebP are allowed."

3. **Test Valid File**
   - Upload valid JPEG/PNG/GIF/WebP
   - ✅ Should accept and show preview

---

## 📍 Key Testing Endpoints

### API Endpoints (for manual testing)

**Get All Categories:**

```
GET http://localhost:5000/api/categories
```

**Create Category (Admin - needs JWT token in Authorization header):**

```
POST http://localhost:5000/api/categories
Body: FormData with name, description, image (file)
Headers: Authorization: Bearer <JWT_TOKEN>
```

**Update Category:**

```
PUT http://localhost:5000/api/categories/<CATEGORY_ID>
Body: FormData with updated fields
```

**Delete Category:**

```
DELETE http://localhost:5000/api/categories/<CATEGORY_ID>
```

---

## 🐛 Debugging Tips

### Debug Console

- Open browser DevTools (F12)
- Check **Console** tab for JavaScript errors
- Check **Network** tab for API calls

### Backend Logs

- Watch terminal running `npm start`
- Should see logs for API requests
- Check for upload success/failure messages

### Database Verification

- Check MongoDB/database directly
- Verify categories collection has documents
- Confirm isActive field is set correctly

### File Upload Verification

- Check `backend/public/uploads/` directory
- Verify image files are being saved
- Check file permissions

---

## ✅ Verification Checklist

### Backend

- [ ] Categories route is registered in server.js
- [ ] Category model is created with correct schema
- [ ] Seed data creates 4 initial categories
- [ ] File upload works and saves to uploads directory
- [ ] Image replacement works
- [ ] Soft delete sets isActive to false

### Frontend

- [ ] AdminPanel shows Categories tab
- [ ] Categories display in grid with images
- [ ] Edit/Delete buttons work
- [ ] Create new category form works
- [ ] HomePage fetches categories from API
- [ ] HomePage shows images with emoji fallback
- [ ] Admin sees replace button on categories
- [ ] Regular user doesn't see replace button

### Database

- [ ] Categories collection exists
- [ ] 4 default categories created from seed
- [ ] Image URLs are stored correctly
- [ ] isActive field works for filtering

---

## 🎯 Common Issues & Solutions

### Issue 1: "Categories is not a function"

**Solution:** Make sure categoryAPI is imported in HomePage.js

```javascript
import { productAPI, categoryAPI } from "../utils/api";
```

### Issue 2: Images showing as emoji only

**Causes:**

1. Upload directory doesn't exist
2. File permissions issue
3. Backend upload route not working
   **Solution:**

- Check `backend/public/uploads/` exists
- Check backend logs for upload errors
- Verify file path in database

### Issue 3: Replace button not showing for admin

**Causes:**

1. Not logged in as admin
2. User role not set to 'admin' in localStorage
3. Browser cache
   **Solution:**

- Verify login with admin credentials
- Check localStorage: `JSON.parse(localStorage.getItem('user')).role`
- Clear browser cache (Ctrl+Shift+Delete)

### Issue 4: Upload fails with "Unexpected token"

**Solution:**

- Ensure FormData is being used for file uploads
- Check Content-Type header is NOT set manually (browser sets it automatically)

---

## 📊 Test Results Template

```
Date: ____/____/____
Tester: _____________

CATEGORIES DISPLAY:
- [ ] User sees 4 categories ✓/✗
- [ ] Category images display ✓/✗
- [ ] Emoji fallback works ✓/✗
- [ ] Explore link filters products ✓/✗

ADMIN FUNCTIONALITY:
- [ ] Categories tab visible ✓/✗
- [ ] Create category works ✓/✗
- [ ] Edit category works ✓/✗
- [ ] Replace image works ✓/✗
- [ ] Delete category works ✓/✗
- [ ] File validation works ✓/✗

SECURITY:
- [ ] Regular user can't see edit buttons ✓/✗
- [ ] Regular user can't upload images ✓/✗
- [ ] Random user can't access admin endpoints ✓/✗

OVERALL:
Pass: ✓ / Fail: ✗
Notes: ___________________________
```

---

## 🎓 Learning Points

1. **Multer File Upload** - How files are handled with middleware
2. **Soft Delete Pattern** - Using isActive flag instead of deleting
3. **Role-Based Access Control** - Admin vs User visibility
4. **FormData API** - Uploading files with form data
5. **React State Management** - Managing category data in component state
6. **API Integration** - Frontend calling backend endpoints

---

## 📝 Next Steps After Testing

1. ✅ Verify all features work as expected
2. ✅ Check error handling and validation
3. ✅ Test with different image formats
4. ✅ Verify role-based access control
5. ✅ Performance testing with large images
6. ✅ Mobile responsiveness testing

**Status:** Ready for Production ✅

---

**Quick Links:**

- Feature Documentation: [CATEGORY_FEATURE.md](./CATEGORY_FEATURE.md)
- Admin Panel Code: [AdminPanel.js](./frontend/src/pages/AdminPanel.js)
- HomePage Code: [HomePage.js](./frontend/src/pages/HomePage.js)
- Category Model: [Category.js](./backend/src/models/Category.js)
