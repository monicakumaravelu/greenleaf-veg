#GreenLeaf Veg – Online Food Ordering & Table Reservation System
GreenLeaf Veg is a full-stack web application designed for vegetarian restaurants to manage online food ordering, table reservations, and administration of orders & bookings — all in one streamlined system.
The project focuses on modern UI/UX, performance, and real-world business workflows such as order management, menu browsing, cart system, and backend reservation validation.

#Features
For Customers (Frontend)

- Browse a fully categorized menu (Starters, Main Course, Beverages, Desserts, etc.)
- Add items to cart dynamically with AJAX-like interactions (no page reloads)
- Modify item quantity / remove items anytime
- Live total price update
- Enter name, phone, and delivery address for orders
- Place food orders (sent to backend + stored in DB)
- Make table reservations with:
  Name, phone, email, date, time, number of guests, table number
  1.5-hour time slot rule( each reservation is of 1.5 hrs)
- Overlapping table reservation prevention

Validations: phone, future date (max 30 days), restaurant timings
✔ Beautiful success pages for both orders and reservations

 Backend Functionality

-  Store orders and ordered items in database
- Store reservation details with business-logic validations
- Automatically calculate total bill
- REST API endpoints used by frontend via fetch()
- JSON-based communication between frontend and backend

# Tech Stack Used

Frontend: HTML5, CSS3, JavaScript (Vanilla), Fetch API
Backend:	Spring Boot (Spring Web, Spring MVC, Spring Data JPA)
Database:	MySQL
Build Tool:	Maven
Server: Embedded Tomcat
Tools Used:  Eclipse IDE, MySQL Workbench
Version Control: Git / GitHub

#Project Highlights

- Modern and aesthetic UI resembling premium restaurant web design
- Fully responsive CSS with mobile-first behavior
- Optimized validations (frontend + backend)
- No frameworks on frontend → pure JavaScript
- Real-time UI updates for cart & reservation timing conflicts
- Image-free menu → highly performant build
