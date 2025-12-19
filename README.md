# BugReport+

A professional-grade **bug tracking and QA workflow application** demonstrating a full-stack architecture with a strong **Test-First** mindset.

BugReport+ integrates a modern React (Tailwind) frontend with a Spring Boot backend, protected by a robust Playwright E2E testing suite and backend integration tests.

---

## 🚀 Overview

BugReport+ is designed with quality as a first-class citizen. While the application provides a clean UI for reporting and managing bugs, the core value lies in its **testing infrastructure, architecture, and scalability**.

### Tech Stack:

**- Frontend**: React 18, Tailwind CSS, Firebase Auth/Firestore

**- Backend**: Spring Boot, Java 21, PostgreSQL (Production / Local), H2 (Testing)

**- Quality Assurance**: Playwright (E2E & UI Testing), JUnit 5, MockMvc (Backend Integration Testing)

### Test Cases:
✅ *GET /api/v1/bugs/{bugId}/comments* should retrieve comments for bug.  
✅ *POST /api/v1/bugs/{bugId}/comments* should create comments for bug.  
✅ *POST /api/v1/bugs/{bugId}/comments* should return 400 Bad Request if comment is empty.  
✅ *POST /api/v1/bugs/{bugId}/comments* should return 404 Not Found if bug is invalid.  
✅ Authorized access should return 401 Unauthorized.  
✅ E2E Automation: Allow creating a new bug, updating its status and comments.


ℹ️ *POST /api/v1/bugs* should successfully report a new bug.  
ℹ️ *GET /api/v1/bugs/{id}* shoild successfully retrieve a bug by Id.  
ℹ️ *GET /api/v1/bugs* should retrieve all bugs in db.   
ℹ️ *PUT /api/v1/bugs/{id}/status* should successfully update the bug status.  
ℹ️ *PUT /api/v1/bugs/{id}/assign* should successfully assign the bug to a specified user.  
ℹ️ *POST /api/v1/bugs* should return 400 Bad Request if a required field (title) is missing.  

---

## 🗺️ Roadmap

### ✅ Phase 1: Foundation

* [x] Initial React UI & Firebase integration
* [x] Spring Boot API with User, Bug, and Comment entities
* [x] Core Playwright E2E test flows

### 🚧 Phase 2: CI/CD Infrastructure

* [ ] GitHub Actions for automated PR testing

### 🔬 Phase 3: Advanced QA

* [ ] Visual Regression Testing
* [ ] k6 Performance Testing
* [ ] Pact Contract Testing


## 🧠 Philosophy

> *Quality is not tested in — it is built in.*

BugReport+ exists to demonstrate how modern QA, testing automation, and backend discipline should be applied in real-world systems.
