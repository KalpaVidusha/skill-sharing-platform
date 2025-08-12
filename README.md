

# 🌟 SkillSphere – Skill-Sharing & Learning Platform

**SkillSphere** is a modern full-stack web platform that enables users to **share skills**, **track learning progress**, and **connect with a global community**. It combines **social networking features** with **structured learning tools** to make skill development engaging and collaborative.

Built with **Spring Boot REST API** (backend) and **React** (frontend), the platform supports real-time communication, cloud-based media storage, and responsive design for an optimal experience on all devices.

<img width="1907" height="996" alt="Image" src="https://github.com/user-attachments/assets/5b12dd33-0711-4489-bf48-f20e85657978" />

---

## 📌 Table of Contents

* [🚀 Key Features](#-key-features)
* [🛠 Technology Stack](#-technology-stack)
* [🏗 System Architecture](#-system-architecture)
* [⚙ Installation Guide](#-installation-guide)
* [👥 Contributors](#-contributors)
* [🤝 Contributing](#-contributing)
* [🙏 Acknowledgments](#-acknowledgments)

---

## 🚀 Key Features

### 🔹 Core Functionality

* **Skill Sharing Posts** with media uploads (up to 3 images/videos per post)
* **Learning Progress Tracking** with customizable templates and visual milestones
* **Structured Learning Plans** with resources and timelines
* **User Engagement** via likes, comments, and follows
* **Social Features** including personalized feeds and chat
* **Secure Authentication** with email/password & **OAuth 2.0** (Google login)

---

### 🔹 Specialized Components

#### **1. User Management** *([Buwaneka99](https://github.com/Buwaneka99)*)

* Secure **email/password authentication**
* **Google OAuth 2.0 integration** for quick login
* User profiles with skills, location, and contact details
* **Follow/unfollow** system for user connections
* **Role-based access control** (User/Admin)

#### **2. Progress Tracking** *([Buwaneka99](https://github.com/Buwaneka99))*

* Customizable templates for various skill types
* Visual timeline of **learning milestones**
* Achievement badges for completed goals
* Likes and comments on progress updates
* Integration with skill posts for practical application

#### **3. Learning Plans** *([Buwaneka99](https://github.com/Buwaneka99))

* Create structured plans with topics, resources, and deadlines
* Visual progress indicators for completion tracking
* Option to share learning plans with the community

#### **4. Social Features** *([Buwaneka99](https://github.com/Buwaneka99))*

* Personalized feed showing posts from followed users
* Real-time **chat system** between users
* Notifications for likes, comments, and follows
* User search and discovery tools
* Follow list management

#### **5. Admin Dashboard** *([Buwaneka99](https://github.com/Buwaneka99))*

* User management tools for admins
* Content moderation panel
* Analytics and statistics visualization
* Progress management system
* Monetization request handling

#### **6. Technical Highlights** *([Buwaneka99](https://github.com/Buwaneka99))*

* Fully responsive design for mobile and desktop
* Secure authentication & authorization layers
* Real-time notifications and chat with WebSockets
* Cloud-based media storage using **Cloudinary**
* Modern UI with animations & smooth transitions
* Data validation and error handling

#### **7. Skill Sharing Posts Management** *([KalpaVidusha](https://github.com/KalpaVidusha))*

* Cloudinary media storage integration
* Media validation (3 files max, 30s video limit)
* Post creation, editing, and deletion

#### **8. Like & Comment Management** *([DilmiJ](https://github.com/DilmiJ))*

* Real-time engagement tracking
* Comment editing/deletion permissions
* Like counters with user tracking

#### **9. Monetization & Reward System** *([SanilkaSrimal](https://github.com/SanilkaSrimal))*

* Monetization request workflow
* Reward tracking and approval system
* Earnings dashboard for content creators

---

## 🛠 Technology Stack

**Backend:**

* Spring Boot 3.1
* Spring Security (OAuth 2.0)
* MongoDB
* Cloudinary (Media Storage)
* Swagger/OpenAPI (API Docs)
* JUnit, Mockito, Testcontainers (Testing)

**Frontend:**

* React 18
* Material-UI
* React Router 6
* React Context API (State Management)
* Axios (HTTP Client)
* react-player, react-dropzone (Media Handling)

---

## 🏗 System Architecture

```mermaid
graph TB
    subgraph "Frontend Layer"
        A[React App]
        B[Material-UI Components]
        C[Real-time Chat]
    end
    
    subgraph "API Gateway"
        D[Spring Boot API]
        E[Security Layer]
        F[WebSocket Handler]
    end
    
    subgraph "Data Layer"
        G[(MongoDB)]
        H[Cloudinary CDN]
        I[OAuth Providers]
    end
    
    A --> D
    B --> D
    C --> F
    D --> G
    D --> H
    E --> I
    
    style A fill:#61DAFB,stroke:#333,stroke-width:2px
    style D fill:#6DB33F,stroke:#333,stroke-width:2px
    style G fill:#4EA94B,stroke:#333,stroke-width:2px
```

---

## ⚙ Installation Guide

### 🎯 Prerequisites

Before diving in, make sure you have these installed:

```bash
☑️ Java 17+ (OpenJDK recommended)
☑️ Node.js 18+ & npm
☑️ MongoDB 6.0+
☑️ Git
☑️ OAuth client secrets
☑️ Cloudinary account (for media storage)
```

### 🛠️ Installation Steps

#### 1️⃣ Clone the Repository
```bash
git clone https://github.com/yourusername/skillshare-platform.git
cd skillshare-platform
```

#### 2️⃣ Backend Setup
```bash
# Navigate to backend directory
cd backend

# Copy and configure environment variables (application.properties)
cp application.properties.example application.properties

    # - MongoDB connection string
    spring.data.mongodb.uri=mongodb://localhost:27017/skillshare
    # Cloudinary API keys
    cloudinary.cloud-name=your_cloud_name
    cloudinary.api-key=your_api_key
    cloudinary.api-secret=your_api_secret
    # OAuth client secrets

# Install dependencies and run
./mvnw clean install
./mvnw spring-boot:run
```

#### 3️⃣ Frontend Setup
```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Start development server
npm start
```
---

## 👥 Contributors

|                                 👨‍💻 Developer        | 🎯 Focus Area    | 🌟 Contribution                                                                     |
|-----------------------------------------------------|-------------------|--------------------------------------------------------------------------------------|
| **[Buwaneka99](https://github.com/Buwaneka99)**     | Full-Stack Lead   | User Management, Progress Tracking, Learning Plans, Social Features, Admin Dashboard |
| **[KalpaVidusha](https://github.com/KalpaVidusha)** | Media Specialist  | Skill Sharing Posts, Cloudinary Integration                                          |
| **[DilmiJ](https://github.com/DilmiJ)**             | Engagement Expert | Like & Comment System, User Interactions                                             |
| **[SanilkaSrimal](https://github.com/SanilkaSrimal)** | Business Logic  | Monetization System, Reward Management                                               |

---

## 🤝 Contributing

We love contributions! Here's how you can help make SkillSphere even better:

### 🌟 Ways to Contribute
- 🐛 **Report Bugs**: Found something broken? Let us know!
- 💡 **Suggest Features**: Have an idea? We'd love to hear it!
- 🔧 **Submit PRs**: Ready to code? Fork and submit a pull request!
- 📖 **Improve Docs**: Help make our documentation clearer

### 🔄 Development Workflow
1. **Fork** the repository
2. **Create** your feature branch (`git checkout -b feature/AmazingFeature`)
3. **Commit** your changes (`git commit -m 'Add some AmazingFeature'`)
4. **Push** to the branch (`git push origin feature/AmazingFeature`)
5. **Open** a Pull Request

---

## 🙏 Acknowledgments

- 💙 **Spring Boot Team** for the amazing framework
- ⚛️ **React Community** for continuous innovation
- 🍃 **MongoDB** for flexible data storage
- ☁️ **Cloudinary** for seamless media management
- 🎨 **Material-UI** for beautiful components

---

<div align="center">

### 🌟 Star us on GitHub if you find SkillSphere helpful!

[![GitHub stars](https://img.shields.io/github/stars/buwaneka99/skill-sharing-platform?style=social&label=Star)](https://github.com/buwaneka99/skill-sharing-platform)

**Made with ❤️ by the SkillSphere Team**

</div>
