# Father Stock - Stock Screening Platform

A modern fullstack stock screening application that intelligently parses Chinese stock filtering criteria and provides comprehensive market analysis.

## 🚀 Features

- **Intelligent Prompt Parsing**: Convert Chinese stock screening prompts into structured criteria
- **Real-time Stock Screening**: Filter stocks based on complex technical and fundamental indicators
- **Scalable Architecture**: Built for extensibility and future feature additions
- **Modern UI**: Clean, responsive interface with real-time updates
- **Multi-deployment**: Ready for Azure, Vercel, and other cloud platforms

## 🛠 Tech Stack

### Backend
- **Python FastAPI**: High-performance API framework
- **PostgreSQL**: Robust database with SQLAlchemy ORM
- **Pandas**: Efficient data processing and analysis
- **Akshare/YFinance**: Stock market data integration
- **Redis**: Caching and background task management
- **Celery**: Asynchronous task processing

### Frontend
- **Next.js 14**: React framework with App Router
- **TypeScript**: Type-safe development
- **Tailwind CSS**: Utility-first styling
- **React Query**: Server state management
- **Recharts**: Data visualization

## 📁 Project Structure

```
father-stock/
├── backend/
│   ├── app/
│   │   ├── main.py              # FastAPI application entry
│   │   ├── models/              # Database models and schemas
│   │   ├── routers/             # API route handlers
│   │   ├── services/            # Business logic layer
│   │   └── utils/               # Utility functions
│   ├── requirements.txt         # Python dependencies
│   └── .env.example            # Environment variables template
├── frontend/
│   ├── src/
│   │   ├── app/                # Next.js App Router pages
│   │   ├── components/         # Reusable UI components
│   │   ├── lib/                # Utility libraries
│   │   └── types/              # TypeScript type definitions
│   ├── package.json            # Node.js dependencies
│   └── next.config.js          # Next.js configuration
└── README.md
```

## 🚀 Quick Start

### Prerequisites
- Python 3.9+
- Node.js 18+
- PostgreSQL (or use SQLite for development)
- Redis (optional, for caching)

### Backend Setup

1. **Navigate to backend directory**:
   ```bash
   cd backend
   ```

2. **Create virtual environment**:
   ```bash
   python -m venv venv
   venv\Scripts\activate  # Windows
   # source venv/bin/activate  # Linux/Mac
   ```

3. **Install dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

4. **Setup environment variables**:
   ```bash
   copy .env.example .env
   # Edit .env with your database credentials
   ```

5. **Start the server**:
   ```bash
   python -m uvicorn app.main:app --reload
   ```

The API will be available at `http://localhost:8000`

### Frontend Setup

1. **Navigate to frontend directory**:
   ```bash
   cd frontend
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Setup environment variables**:
   ```bash
   copy .env.example .env.local
   ```

4. **Start development server**:
   ```bash
   npm run dev
   ```

The frontend will be available at `http://localhost:3000`

## 📊 Example Usage

### Chinese Prompt Input
```
今日9点30分至9点33分特大单净额排名行业前15或今日9点30分至9点33分特大单净额排名行业前20%；
今日竞价分时涨跌幅大于0小于4；
今日9点30分至9点33分均价/开盘价大于1.003；
主板非ST且市值小于200亿
```

### Parsed Criteria
- Time range: 09:30 to 09:33
- Large order industry ranking: top 15 or top 20%
- Bid amplitude: 0% to 4%
- Average price ratio > 1.003
- Main board, non-ST stocks
- Market cap < 20B CNY

## 🌐 Deployment

### Vercel (Frontend)
```bash
npm run build
# Deploy to Vercel via GitHub integration
```

### Azure (Backend)
```dockerfile
# Use provided Dockerfile
docker build -t father-stock-api .
# Deploy to Azure Container Apps
```

### Environment Variables

#### Backend (.env)
```env
DATABASE_URL=postgresql://user:pass@localhost:5432/fatherstock
REDIS_URL=redis://localhost:6379
SECRET_KEY=your-secret-key
CORS_ORIGINS=["http://localhost:3000","https://yourdomain.com"]
```

#### Frontend (.env.local)
```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

## 🔧 Development

### Adding New Screening Criteria
1. Update `ScreeningCriteria` schema in `backend/app/models/schemas.py`
2. Enhance prompt parsing logic in `backend/app/utils/prompt_parser.py`
3. Implement filtering logic in `backend/app/services/screening_service.py`
4. Update frontend types in `frontend/src/types/index.ts`

### API Documentation
Visit `http://localhost:8000/docs` for interactive API documentation.

## 📈 Roadmap

- [ ] Real-time stock data integration
- [ ] Advanced charting and visualization
- [ ] Portfolio management features
- [ ] Machine learning stock predictions
- [ ] Mobile app development
- [ ] Multi-language support

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 📞 Support

For questions and support, please open an issue in the GitHub repository.

---

Built with ❤️ for the Chinese stock market analysis community.
