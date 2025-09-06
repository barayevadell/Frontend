# College Request Management System

This project was developed as part of the *Frontend Development and Implementation* course.  
The system allows students and administrators to manage requests in different topics, with clear forms and management screens.

---

## Purpose
- Enable students to open new requests and manage conversations with the college staff.  
- Provide administrators with tools to manage users, request topics, and monitor all requests.  
- Store all data in the browser *Local Storage*, with automatic initial sample data.

---

## Main Screens
- *Home* – Overview of recent requests and button to create a new request.  
- *Login* – User login with predefined credentials.  
- *Open / Closed / All Requests* – Filter and view requests by status.  
- *Request Conversation* – Full conversation thread between student and staff, with replies.  
- *Manage Users* – Admin screen to add, edit or delete system users.  
- *Manage Topics* – Admin screen to manage request topics.  
- *Statistics* – Overview of number of requests, status distribution, and average response times.  
- *Help* – Short user guide.

---

## Forms
- *New Request Form* – Submit a request for a selected topic, with description and optional file.  
- *User Form* – Add a new user with personal details and role.  
- *Topic Form* – Add a new topic to the list of request categories.

---

## Technical Features
- All data is stored in *Local Storage*.  
- On first load, if storage is empty, the app generates *at least 10 sample objects* for each entity (Users, Topics, Requests, Messages).  
- All form fields include validation (required, proper formats).  
- Success notifications are shown using *Material UI Snackbar*.  
- The UI is fully built with *Material UI* components for consistency.

---

## Summary
This is a *college request management system*:  
Students can open and track requests, administrators can manage users and topics, and everyone has a clear interface to view and interact with the system data.