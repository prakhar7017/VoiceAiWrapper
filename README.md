# Voice AI Wrapper

A modern project management system with voice AI capabilities, built with Django, GraphQL, React, and TypeScript.

## 🚀 Features

- **Project Management**: Create, organize, and track projects
- **Task Management**: Manage tasks with priorities, statuses, and assignments
- **Real-time Updates**: Stay in sync with live updates
- **Responsive Design**: Works on desktop and mobile devices
- **Voice Commands**: Control the application using voice (coming soon)

## 🛠️ Tech Stack

### Frontend

- React 18 with TypeScript
- Apollo Client for GraphQL
- Tailwind CSS for styling
- Zustand for state management
- React Router for navigation

### Backend

- Django with Django REST framework
- Graphene for GraphQL API
- PostgreSQL database
- JWT authentication

## 🚀 Getting Started

### Prerequisites

- Node.js 16+ and npm 8+
- Python 3.9+
- PostgreSQL 13+

### Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/prakhar7017/VoiceAiWrapper.git
   cd VoiceAiWrapper
   ```

2. **Set up the backend**

   ```bash
   cd backend
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   pip install -r requirements.txt
   python manage.py migrate
   python manage.py runserver
   ```

3. **Set up the frontend**

   ```bash
   cd ../frontend
   npm install
   npm run dev
   ```

4. **Access the application**
   - Frontend: [http://localhost:3000](http://localhost:3000)
   - Backend API: [http://localhost:8000/graphql](http://localhost:8000/graphql)

## 📁 Project Structure

```plaintext
VoiceAiWrapper/
├── backend/               # Django backend
│   ├── core/             # Main Django app
│   ├── config/           # Django settings
│   └── manage.py
├── frontend/             # React frontend
│   ├── public/
│   ├── src/
│   │   ├── components/   # Reusable components
│   │   ├── pages/        # Page components
│   │   ├── store/        # State management
│   │   └── types/        # TypeScript types
│   └── package.json
└── README.md
```

## 🔧 Environment Variables

### Backend Environment

Create a `.env` file in the `backend` directory:

```env
DEBUG=True
SECRET_KEY=your-secret-key
DATABASE_URL=postgres://user:password@localhost:5432/voiceai
ALLOWED_HOSTS=localhost,127.0.0.1
```

### Frontend Environment

Create a `.env` file in the `frontend` directory:

```env
VITE_API_URL=http://localhost:8000/graphql
VITE_WS_URL=ws://localhost:8000/graphql
```

## 🤝 Contributing

1. Fork the project
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👏 Acknowledgments

- [Django](https://www.djangoproject.com/)
- [React](https://reactjs.org/)
- [GraphQL](https://graphql.org/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Apollo Client](https://www.apollographql.com/docs/react/)

## 🔄 Trade-offs

### Architecture Decisions

- **GraphQL vs REST**: We chose GraphQL for its flexibility in data fetching and reduced over-fetching, but this comes with a steeper learning curve and potentially more complex server implementation.
- **Django vs Node.js**: Django provides a robust ORM and admin interface out of the box, but may have slower response times compared to Node.js for certain operations.
- **Zustand vs Redux**: Zustand was selected for its simplicity and reduced boilerplate compared to Redux, though it may offer less middleware support.

### Technical Considerations

- **PostgreSQL**: Offers excellent support for complex queries and transactions but requires more resources than lighter databases like SQLite for development.
- **JWT Authentication**: Provides stateless authentication but requires careful handling of token expiration and security.
- **Docker Deployment**: Ensures consistency across environments but adds complexity to the development workflow.

## 🔮 Future Enhancements

### Short-term Roadmap

- **Voice Command Integration**: Implement core voice control features using Web Speech API or a third-party service.
- **Offline Support**: Add service workers for basic offline functionality.
- **Enhanced Notifications**: Implement real-time notifications for project updates.

### Mid-term Goals

- **AI-Powered Task Suggestions**: Implement machine learning to suggest task prioritization.
- **Team Collaboration Features**: Add commenting, @mentions, and shared workspaces.
- **Mobile Applications**: Develop native mobile apps for iOS and Android.

### Long-term Vision

- **Advanced Analytics**: Provide insights into project progress and team productivity.
- **Integration Ecosystem**: Build connectors for popular tools like Slack, GitHub, and Jira.
- **Enterprise Features**: Implement SSO, role-based access control, and compliance reporting.
