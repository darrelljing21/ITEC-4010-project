# 3. Software Requirements Specification

## 3.1 Introduction

### 3.1.1 Purpose
This Software Requirements Specification (SRS) aims to specify and outline all software requirements for the Community Food Sharing Platform, a system that links local businesses with community members in an effort to decrease food waste. The functionality, interfaces, performance requirements, quality attributes, and limitations of the system are described in this document. It will act as a guide for the stakeholders and development team to guarantee that the system goals are consistently understood.

### 3.1.2 Scope
The Community Food Sharing Platform is a web-based system that allows retailers (such as restaurants, bakeries, and grocery shops) to post surplus or almost expired food products for recipients (Users) to reserve and pick up.

The system's core procedure is as follows: Listing → Reservation → Pickup → Review.

Key functions involve donors creating and managing food listings. Users may explore, reserve, and pick up available products. The method is intended to promote sustainability, decrease food waste, and develop community collaboration.

### 3.1.3 Definitions and Abbreviations
- **UI** – User Interface
- **DBMS** – Database Management System
- **API** – Application Programming Interface
- **SRS** – Software Requirement Specification

### 3.1.4 References
- ITEC 4010 Course Materials for Systems Analysis and Design.
- Communication and feedback from stakeholders (the instructor).

## 3.2 Overall Description

### 3.2.1 Product Perspective
The platform is a standalone online application based on a client-server architecture. User, donor, and food listing information are stored in a single database.

The system will feature two primary actors:

1. **Donors** – Post and maintain food listings.
2. **Users** – Browse, reserve, and evaluate available food products.

The platform may be upgraded in the future to incorporate API connectors with map services or contribution centers.

### 3.2.2 Product Functions
- **Donor features include the following:**
  - Secure registration and log-in.
  - Create, modify, and remove food listings.
  - View bookings and mark them as "picked up."
- **User features include the following:**
  - Secure registration and log-in.
  - Browse and search food listings by location, category, and expiration date.
  - Reserve products and receive confirmation.
  - Submit ratings and feedback after pickup.

### 3.2.3 User Characteristics
- **Donors** – Employees or business owners with minimal digital literacy.
- **Users** – Community members seeking free or inexpensive food who regularly use the internet.

### 3.2.4 Constraints
- Must abide by laws pertaining to data protection and privacy.
- The system needs to function in a typical web browser.
- All users must have internet access.
- Server uptime limits system availability.

### 3.2.5 Assumptions and Dependencies
- Devices with internet connectivity are available to users and donors.
- Database and server hosting services are continuously available.
- Donors appropriately input food listings.

## 3.3 Specific Requirements

### 3.3.1 Functional Requirements
| ID | Requirement Description |
| --- | --- |
| FR-1 | Donors will be able to safely register and log in using the system. |
| FR-2 | Users will be able to safely register and log in using the system. |
| FR-3 | Food listings with name, description, quantity, expiration date, and image may be posted by donors using the system. |
| FR-4 | The system will present users with a searchable and filterable list of all the food products that are offered. |
| FR-5 | Users will be able to reserve available food products using the system. |
| FR-6 | The system will notify the user and donors that the reservation was successful. |
| FR-7 | Donors will be able to change the availability, reservation, and pick-up status of food offerings through the system. |
| FR-8 | After pickup, users will be able to rate and evaluate the system. |
| FR-9 | All data will be safely stored in the database by the system. |
| FR-10 | Donors will be able to access and evaluate their reservation history using the system. |

### 3.3.2 External Interface Requirements

#### 3.3.2.1 User Interfaces
- Both desktop and mobile browsers will be able to access the platform's online interface.
- The interface will include the following features:
  - Pages for registration and login
  - Dashboard for donors
  - Listing pages for food
  - Reservation confirmation page
  - Review submission page

#### 3.3.2.2 Hardware Interfaces
- Any desktop computer or mobile device with a web browser installed will be able to use the system.

#### 3.3.2.3 Software Interfaces
- The system will establish a connection with a relational database, such as PostgreSQL or MySQL.
- In later iterations, the system may connect with third-party APIs (like the Google Maps API).

#### 3.3.2.4 Communication Interfaces
- Client-server secure HTTPS communication must be supported by the system.

### 3.3.3 Performance Requirements
- At least 500 people must be able to access the system at once without experiencing any noticeable lag.
- Under typical network circumstances, the average page load time should not be more than three seconds.
- 99% uptime must be maintained by the system during business hours.

### 3.3.4 Quality Attributes
| Attribute | Requirement |
| --- | --- |
| Usability | For both kinds of users, the interface must be simple to use and intuitive. |
| Security | Passwords must be encrypted using a safe hashing technique, such as SHA-256. |
| Maintainability | The codebase will be modular and documented for future releases. |
| Reliability | The system will recover from crashes and handle input mistakes appropriately. |
| Scalability | The system will be able to handle an increase in donors, listings, and users. |
| Portability | The web application must work with Chrome, Firefox, Edge, and Safari. |

### 3.3.5 Design Constraints
- Open-source technologies (such as HTML, CSS, JavaScript, Node.js/Python, and MySQL) will be used to develop the system.
- The platform must follow W3C web accessibility guidelines.
- HTTPS must be supported for secure communication.
- Modern browsers for Windows, macOS, and mobile operating systems must be supported by the operating environment.
- The interface will employ a responsive design to guarantee usability across a range of devices.
- The prototype will be developed using open-source frameworks to minimize cost.

## 3.4 System Feature Summary

### 3.4.1 Food Listing Management
Donors can add, edit, and remove food listings, including item descriptions and photos.

### 3.4.2 Reservation and Pickup Process
Users can reserve items, receive confirmation, and pick up items at specified times. Donors can mark items as "picked up."

### 3.4.3 Review System
Following pickup, users can write reviews and rate retailers.

### 3.4.4 User Accounts
Individual accounts for users and donors provide secure data storage and personalized access.

## 3.5 Database Requirements

### 3.5.1 Database Entities
1. **User Table**
   - `user_id` (Primary Key)
   - `name`
   - `email`
   - `password_hash`
   - `user_type` (donor/customer)
2. **Donor Table**
   - `donor_id` (Primary Key)
   - `user_id` (Foreign Key)
   - `business_name`
   - `location`
   - `contact_info`
3. **Food Table**
   - `food_id` (Primary Key)
   - `donor_id` (Foreign Key)
   - `food_name`
   - `description`
   - `expiry_date`
   - `quantity`
   - `image_url`
   - `status`
4. **Order Table**
   - `order_id` (Primary Key)
   - `user_id` (Foreign Key)
   - `food_id` (Foreign Key)
   - `reservation_time`
   - `pickup_status`
   - `review_rating` (nullable)
   - `review_comment` (nullable)
