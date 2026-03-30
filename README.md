# Performance Analyze

A comprehensive employee performance evaluation system that leverages machine learning to analyze daily work logs and provide actionable insights for both employees and managers.

## 🚀 Features

### For Employees
- **Daily Logging**: Record daily tasks, learnings, and challenges
- **Performance Insights**: View AI-powered analysis of work patterns
- **Log History**: Track and review past performance logs
- **Dashboard**: Personalized overview of performance metrics

### For Managers
- **Review System**: Approve/reject employee daily logs with feedback
- **BIA Analysis**: Behavioral Impact Analysis using ML models
- **Team Analytics**: Comprehensive team performance insights
- **Review Analytics**: Data-driven review patterns and trends

### AI/ML Features
- **Natural Language Processing**: Analyzes text entries for sentiment and performance indicators
- **Behavioral Scoring**: ML-based scoring system for performance evaluation
- **Trend Analysis**: Identifies patterns in employee performance over time

## 🏗️ Architecture

### Frontend (React + Vite)
- **Framework**: React 19.2.0 with Vite
- **Styling**: TailwindCSS with shadcn/ui components
- **Routing**: React Router DOM
- **Charts**: Recharts for data visualization
- **State Management**: React Context API

### Backend (Node.js + Express)
- **Framework**: Express.js 5.2.1
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT-based authentication
- **Security**: bcryptjs for password hashing
- **CORS**: Cross-origin resource sharing enabled

### ML Model (Python + FastAPI)
- **Framework**: FastAPI for ML model serving
- **Libraries**: NumPy, Pandas, Scikit-learn
- **Features**: 
  - Sentiment analysis
  - Performance keyword extraction
  - Behavioral pattern recognition
  - Automated scoring system

## 📁 Project Structure

```
Performance-Analyze/
├── backend/                 # Node.js Express API
│   ├── Config/             # Database configuration
│   ├── Controller/         # Route controllers
│   ├── Models/             # MongoDB schemas
│   ├── Routes/             # API routes
│   ├── middleware/         # Authentication middleware
│   └── server.js           # Main server file
├── frontend/               # React application
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/          # Page components
│   │   ├── context/        # React context providers
│   │   └── lib/            # Utility functions
│   └── public/             # Static assets
├── ML-Model/               # Python ML service
│   ├── source/             # Training data and models
│   ├── bia_model.py        # Core ML model
│   └── main.py             # FastAPI server
└── README.md               # This file
```

## 🚀 Getting Started

### Prerequisites
- Node.js (v18 or higher)
- Python (v3.8 or higher)
- MongoDB instance
- npm/yarn package manager

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd Performance-Analyze
   ```

2. **Backend Setup**
   ```bash
   cd backend
   npm install
   cp .env.example .env  # Configure your environment variables
   npm run dev
   ```

3. **Frontend Setup**
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

4. **ML Model Setup**
   ```bash
   cd ML-Model
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   pip install -r requirements.txt
   python main.py
   ```

### Environment Variables

Create a `.env` file in the backend directory:

```env
MONGODB_URL=mongodb://localhost:27017
PORT=4000
JWT_SECRET=your-jwt-secret-key
```

## 🔗 API Endpoints

### Authentication
- `POST /api/user/register` - User registration
- `POST /api/user/login` - User login

### Employee Routes
- `POST /api/employee/daily-log` - Create daily log
- `GET /api/employee/my-logs` - Get employee logs
- `PUT /api/employee/daily-log/:id` - Update daily log

### Manager Routes
- `GET /api/manager/pending-logs` - Get pending logs for review
- `POST /api/manager/review-log` - Review and provide feedback
- `GET /api/manager/analytics` - Get team analytics

### ML Model Endpoints
- `POST /analyze` - Analyze performance data
- `POST /score-log` - Score individual log entries
- `GET /` - Health check

## 🧠 ML Model Features

The ML model analyzes daily logs using:

### Keyword Analysis
- **Positive Words**: Achievement-oriented terms
- **Negative Words**: Challenge/blocker indicators
- **Learning Words**: Skill development terms
- **Task Words**: Completion-focused terms
- **Collaboration Words**: Teamwork indicators
- **Quality Words**: Code quality and improvement terms

### Scoring System
- Automated performance scoring based on log content
- Sentiment analysis for emotional tone
- Behavioral pattern recognition
- Trend analysis over time

## 📊 Database Schema

### User Model
```javascript
{
  name: String,
  email: String (unique),
  password: String (hashed),
  role: String ("Employee" | "Manager"),
  timestamps: true
}
```

### Daily Log Model
```javascript
{
  userId: ObjectId (ref: User),
  tasks: String,
  learnings: String,
  challenges: String,
  logDate: Date,
  status: String ("pending" | "approved" | "rejected"),
  managerFeedback: String,
  approvedBy: ObjectId (ref: User),
  approvedAt: Date,
  timestamps: true
}
```

## 🎯 User Roles

### Employee
- Create and manage daily logs
- View personal performance insights
- Track learning progress
- Receive manager feedback

### Manager
- Review and approve employee logs
- Provide constructive feedback
- Access team analytics and insights
- Monitor team performance trends

## 🔧 Technologies Used

### Frontend Stack
- React 19.2.0
- Vite 7.3.0
- TailwindCSS 4.1.17
- shadcn/ui components
- Lucide React icons
- Recharts for data visualization
- Axios for API calls

### Backend Stack
- Node.js with Express 5.2.1
- MongoDB with Mongoose 9.0.0
- JWT for authentication
- bcryptjs for password hashing
- CORS for cross-origin requests

### ML Stack
- Python with FastAPI
- NumPy and Pandas for data processing
- Scikit-learn for machine learning
- Custom behavioral analysis algorithms

## 🚀 Deployment

### Frontend Deployment
```bash
cd frontend
npm run build
# Deploy the dist/ folder to your hosting service
```

### Backend Deployment
```bash
cd backend
npm start
# Ensure MongoDB is accessible and environment variables are set
```

### ML Model Deployment
```bash
cd ML-Model
# Deploy using Docker or cloud ML services
# Ensure FastAPI server is accessible at configured endpoint
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the ISC License - see the package.json file for details.

## 📞 Support

For support and queries, please reach out to the development team or create an issue in the repository.

---

**Performance Analyze** - Transforming employee evaluation through intelligent analysis and actionable insights.
